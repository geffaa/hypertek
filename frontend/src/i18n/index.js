import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

/* ── Base files (nav / auth / hero / footer / etc.) ─────────────────── */
import en   from "./locales/en.json";
import zh   from "./locales/zh.json";
import ko   from "./locales/ko.json";
import ja   from "./locales/ja.json";
import pt   from "./locales/pt.json";
import fr   from "./locales/fr.json";
import de   from "./locales/de.json";
import it   from "./locales/it.json";
import es   from "./locales/es.json";
import ru   from "./locales/ru.json";
import pl   from "./locales/pl.json";
import el   from "./locales/el.json";
import ro   from "./locales/ro.json";
import ar   from "./locales/ar.json";
import he   from "./locales/he.json";
import tr   from "./locales/tr.json";
import th   from "./locales/th.json";
import vi   from "./locales/vi.json";
import id   from "./locales/id.json";
import ms   from "./locales/ms.json";
import fil  from "./locales/fil.json";
import no   from "./locales/no.json";
import sv   from "./locales/sv.json";
import da   from "./locales/da.json";
import nl   from "./locales/nl.json";
import zhTW from "./locales/zh-TW.json";
import hi   from "./locales/hi.json";

/* ── Game HUD (all 27) ───────────────────────────────────────────────── */
import gameEn   from "./locales/game-en.json";
import gameZh   from "./locales/game-zh.json";
import gameKo   from "./locales/game-ko.json";
import gameJa   from "./locales/game-ja.json";
import gamePt   from "./locales/game-pt.json";
import gameFr   from "./locales/game-fr.json";
import gameDe   from "./locales/game-de.json";
import gameIt   from "./locales/game-it.json";
import gameEs   from "./locales/game-es.json";
import gameRu   from "./locales/game-ru.json";
import gamePl   from "./locales/game-pl.json";
import gameEl   from "./locales/game-el.json";
import gameRo   from "./locales/game-ro.json";
import gameAr   from "./locales/game-ar.json";
import gameHe   from "./locales/game-he.json";
import gameTr   from "./locales/game-tr.json";
import gameTh   from "./locales/game-th.json";
import gameVi   from "./locales/game-vi.json";
import gameId   from "./locales/game-id.json";
import gameMs   from "./locales/game-ms.json";
import gameFil  from "./locales/game-fil.json";
import gameNo   from "./locales/game-no.json";
import gameSv   from "./locales/game-sv.json";
import gameDa   from "./locales/game-da.json";
import gameNl   from "./locales/game-nl.json";
import gameZhTW from "./locales/game-zh-TW.json";
import gameHi   from "./locales/game-hi.json";

/* ── About (all 27) ─────────────────────────────────────────────────── */
import aboutEn   from "./locales/about-en.json";
import aboutZh   from "./locales/about-zh.json";
import aboutKo   from "./locales/about-ko.json";
import aboutJa   from "./locales/about-ja.json";
import aboutPt   from "./locales/about-pt.json";
import aboutFr   from "./locales/about-fr.json";
import aboutDe   from "./locales/about-de.json";
import aboutIt   from "./locales/about-it.json";
import aboutEs   from "./locales/about-es.json";
import aboutRu   from "./locales/about-ru.json";
import aboutPl   from "./locales/about-pl.json";
import aboutEl   from "./locales/about-el.json";
import aboutRo   from "./locales/about-ro.json";
import aboutAr   from "./locales/about-ar.json";
import aboutHe   from "./locales/about-he.json";
import aboutTr   from "./locales/about-tr.json";
import aboutTh   from "./locales/about-th.json";
import aboutVi   from "./locales/about-vi.json";
import aboutId   from "./locales/about-id.json";
import aboutMs   from "./locales/about-ms.json";
import aboutFil  from "./locales/about-fil.json";
import aboutNo   from "./locales/about-no.json";
import aboutSv   from "./locales/about-sv.json";
import aboutDa   from "./locales/about-da.json";
import aboutNl   from "./locales/about-nl.json";
import aboutZhTW from "./locales/about-zh-TW.json";
import aboutHi   from "./locales/about-hi.json";

/* ── News (all 27) ──────────────────────────────────────────────────── */
import newsEn   from "./locales/news-en.json";
import newsZh   from "./locales/news-zh.json";
import newsKo   from "./locales/news-ko.json";
import newsJa   from "./locales/news-ja.json";
import newsPt   from "./locales/news-pt.json";
import newsFr   from "./locales/news-fr.json";
import newsDe   from "./locales/news-de.json";
import newsIt   from "./locales/news-it.json";
import newsEs   from "./locales/news-es.json";
import newsRu   from "./locales/news-ru.json";
import newsPl   from "./locales/news-pl.json";
import newsEl   from "./locales/news-el.json";
import newsRo   from "./locales/news-ro.json";
import newsAr   from "./locales/news-ar.json";
import newsHe   from "./locales/news-he.json";
import newsTr   from "./locales/news-tr.json";
import newsTh   from "./locales/news-th.json";
import newsVi   from "./locales/news-vi.json";
import newsId   from "./locales/news-id.json";
import newsMs   from "./locales/news-ms.json";
import newsFil  from "./locales/news-fil.json";
import newsNo   from "./locales/news-no.json";
import newsSv   from "./locales/news-sv.json";
import newsDa   from "./locales/news-da.json";
import newsNl   from "./locales/news-nl.json";
import newsZhTW from "./locales/news-zh-TW.json";
import newsHi   from "./locales/news-hi.json";

/* ── Marketplace (all 27) ───────────────────────────────────────────── */
import marketplaceEn   from "./locales/marketplace-en.json";
import marketplaceZh   from "./locales/marketplace-zh.json";
import marketplaceKo   from "./locales/marketplace-ko.json";
import marketplaceJa   from "./locales/marketplace-ja.json";
import marketplacePt   from "./locales/marketplace-pt.json";
import marketplaceFr   from "./locales/marketplace-fr.json";
import marketplaceDe   from "./locales/marketplace-de.json";
import marketplaceIt   from "./locales/marketplace-it.json";
import marketplaceEs   from "./locales/marketplace-es.json";
import marketplaceRu   from "./locales/marketplace-ru.json";
import marketplacePl   from "./locales/marketplace-pl.json";
import marketplaceEl   from "./locales/marketplace-el.json";
import marketplaceRo   from "./locales/marketplace-ro.json";
import marketplaceAr   from "./locales/marketplace-ar.json";
import marketplaceHe   from "./locales/marketplace-he.json";
import marketplaceTr   from "./locales/marketplace-tr.json";
import marketplaceTh   from "./locales/marketplace-th.json";
import marketplaceVi   from "./locales/marketplace-vi.json";
import marketplaceId   from "./locales/marketplace-id.json";
import marketplaceMs   from "./locales/marketplace-ms.json";
import marketplaceFil  from "./locales/marketplace-fil.json";
import marketplaceNo   from "./locales/marketplace-no.json";
import marketplaceSv   from "./locales/marketplace-sv.json";
import marketplaceDa   from "./locales/marketplace-da.json";
import marketplaceNl   from "./locales/marketplace-nl.json";
import marketplaceZhTW from "./locales/marketplace-zh-TW.json";
import marketplaceHi   from "./locales/marketplace-hi.json";

/* ── Pages (all 27) ─────────────────────────────────────────────────── */
import pagesEn   from "./locales/pages-en.json";
import pagesZh   from "./locales/pages-zh.json";
import pagesKo   from "./locales/pages-ko.json";
import pagesJa   from "./locales/pages-ja.json";
import pagesPt   from "./locales/pages-pt.json";
import pagesFr   from "./locales/pages-fr.json";
import pagesDe   from "./locales/pages-de.json";
import pagesIt   from "./locales/pages-it.json";
import pagesEs   from "./locales/pages-es.json";
import pagesRu   from "./locales/pages-ru.json";
import pagesPl   from "./locales/pages-pl.json";
import pagesEl   from "./locales/pages-el.json";
import pagesRo   from "./locales/pages-ro.json";
import pagesAr   from "./locales/pages-ar.json";
import pagesHe   from "./locales/pages-he.json";
import pagesTr   from "./locales/pages-tr.json";
import pagesTh   from "./locales/pages-th.json";
import pagesVi   from "./locales/pages-vi.json";
import pagesId   from "./locales/pages-id.json";
import pagesMs   from "./locales/pages-ms.json";
import pagesFil  from "./locales/pages-fil.json";
import pagesNo   from "./locales/pages-no.json";
import pagesSv   from "./locales/pages-sv.json";
import pagesDa   from "./locales/pages-da.json";
import pagesNl   from "./locales/pages-nl.json";
import pagesZhTW from "./locales/pages-zh-TW.json";
import pagesHi   from "./locales/pages-hi.json";

/* English base — fallback for any key not present in a language file */
const enBase = {
  ...en, ...gameEn, ...aboutEn, ...newsEn, ...marketplaceEn, ...pagesEn,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:    { translation: { ...en,   ...gameEn,   ...aboutEn,   ...newsEn,   ...marketplaceEn,   ...pagesEn   } },
      zh:    { translation: { ...zh,   ...gameZh,   ...aboutZh,   ...newsZh,   ...marketplaceZh,   ...pagesZh   } },
      ko:    { translation: { ...ko,   ...gameKo,   ...aboutKo,   ...newsKo,   ...marketplaceKo,   ...pagesKo   } },
      ja:    { translation: { ...ja,   ...gameJa,   ...aboutJa,   ...newsJa,   ...marketplaceJa,   ...pagesJa   } },
      pt:    { translation: { ...pt,   ...gamePt,   ...aboutPt,   ...newsPt,   ...marketplacePt,   ...pagesPt   } },
      fr:    { translation: { ...enBase, ...fr,   ...gameFr,   ...aboutFr,   ...newsFr,   ...marketplaceFr,   ...pagesFr   } },
      de:    { translation: { ...enBase, ...de,   ...gameDe,   ...aboutDe,   ...newsDe,   ...marketplaceDe,   ...pagesDe   } },
      it:    { translation: { ...enBase, ...it,   ...gameIt,   ...aboutIt,   ...newsIt,   ...marketplaceIt,   ...pagesIt   } },
      es:    { translation: { ...enBase, ...es,   ...gameEs,   ...aboutEs,   ...newsEs,   ...marketplaceEs,   ...pagesEs   } },
      ru:    { translation: { ...enBase, ...ru,   ...gameRu,   ...aboutRu,   ...newsRu,   ...marketplaceRu,   ...pagesRu   } },
      pl:    { translation: { ...enBase, ...pl,   ...gamePl,   ...aboutPl,   ...newsPl,   ...marketplacePl,   ...pagesPl   } },
      el:    { translation: { ...enBase, ...el,   ...gameEl,   ...aboutEl,   ...newsEl,   ...marketplaceEl,   ...pagesEl   } },
      ro:    { translation: { ...enBase, ...ro,   ...gameRo,   ...aboutRo,   ...newsRo,   ...marketplaceRo,   ...pagesRo   } },
      ar:    { translation: { ...enBase, ...ar,   ...gameAr,   ...aboutAr,   ...newsAr,   ...marketplaceAr,   ...pagesAr   } },
      he:    { translation: { ...enBase, ...he,   ...gameHe,   ...aboutHe,   ...newsHe,   ...marketplaceHe,   ...pagesHe   } },
      tr:    { translation: { ...enBase, ...tr,   ...gameTr,   ...aboutTr,   ...newsTr,   ...marketplaceTr,   ...pagesTr   } },
      th:    { translation: { ...enBase, ...th,   ...gameTh,   ...aboutTh,   ...newsTh,   ...marketplaceTh,   ...pagesTh   } },
      vi:    { translation: { ...enBase, ...vi,   ...gameVi,   ...aboutVi,   ...newsVi,   ...marketplaceVi,   ...pagesVi   } },
      id:    { translation: { ...enBase, ...id,   ...gameId,   ...aboutId,   ...newsId,   ...marketplaceId,   ...pagesId   } },
      ms:    { translation: { ...enBase, ...ms,   ...gameMs,   ...aboutMs,   ...newsMs,   ...marketplaceMs,   ...pagesMs   } },
      fil:   { translation: { ...enBase, ...fil,  ...gameFil,  ...aboutFil,  ...newsFil,  ...marketplaceFil,  ...pagesFil  } },
      no:    { translation: { ...enBase, ...no,   ...gameNo,   ...aboutNo,   ...newsNo,   ...marketplaceNo,   ...pagesNo   } },
      sv:    { translation: { ...enBase, ...sv,   ...gameSv,   ...aboutSv,   ...newsSv,   ...marketplaceSv,   ...pagesSv   } },
      da:    { translation: { ...enBase, ...da,   ...gameDa,   ...aboutDa,   ...newsDa,   ...marketplaceDa,   ...pagesDa   } },
      nl:    { translation: { ...enBase, ...nl,   ...gameNl,   ...aboutNl,   ...newsNl,   ...marketplaceNl,   ...pagesNl   } },
      "zh-TW": { translation: { ...enBase, ...zhTW, ...gameZhTW, ...aboutZhTW, ...newsZhTW, ...marketplaceZhTW, ...pagesZhTW } },
      hi:    { translation: { ...enBase, ...hi,   ...gameHi,   ...aboutHi,   ...newsHi,   ...marketplaceHi,   ...pagesHi   } },
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
