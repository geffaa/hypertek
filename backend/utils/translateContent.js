import { translate } from "@vitalets/google-translate-api";

// All supported languages (matches frontend locale files)
export const SUPPORTED_LANGS = [
  "ar", "da", "de", "el", "es", "tl", "fr", "iw", "hi", "id",
  "it", "ja", "ko", "ms", "nl", "no", "pl", "pt", "ro", "ru",
  "sv", "th", "tr", "vi", "zh-TW", "zh-CN",
];

// Map from locale code to Google Translate language code
const LOCALE_TO_GT = {
  "ar": "ar", "da": "da", "de": "de", "el": "el", "es": "es",
  "fil": "tl", "fr": "fr", "he": "iw", "hi": "hi", "id": "id",
  "it": "it", "ja": "ja", "ko": "ko", "ms": "ms", "nl": "nl",
  "no": "no", "pl": "pl", "pt": "pt", "ro": "ro", "ru": "ru",
  "sv": "sv", "th": "th", "tr": "tr", "vi": "vi",
  "zh-TW": "zh-TW", "zh": "zh-CN",
};

// Map from Google Translate code back to locale code (for DB key)
const GT_TO_LOCALE = Object.fromEntries(
  Object.entries(LOCALE_TO_GT).map(([locale, gt]) => [gt, locale])
);

async function translateText(text, targetLang) {
  try {
    const result = await translate(text, { to: targetLang });
    return result.text || text;
  } catch {
    return text; // fallback to original on error
  }
}

/**
 * Translate heading and description to all supported languages.
 * Returns a Map-compatible object: { ko: { heading, description }, id: { heading, description }, ... }
 */
export async function translateNewsContent(heading, description) {
  const translations = {};

  for (const [localeCode, gtCode] of Object.entries(LOCALE_TO_GT)) {
    try {
      const [tHeading, tDesc] = await Promise.all([
        translateText(heading, gtCode),
        translateText(description, gtCode),
      ]);
      translations[localeCode] = { heading: tHeading, description: tDesc };
    } catch {
      // skip this lang on error
    }
    // small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 150));
  }

  return translations;
}

/**
 * Pick translated content for the requested locale.
 * Falls back to English if translation is missing.
 */
export function getLocalizedNews(newsDoc, lang) {
  if (!lang || lang === "en" || lang === "en-US") {
    return { heading: newsDoc.heading, description: newsDoc.description };
  }

  // Mongoose Map type requires .get(), plain object fallback uses bracket notation
  const translations = newsDoc.translations;
  const trans = translations?.get
    ? translations.get(lang)
    : translations?.[lang];

  if (trans?.heading && trans?.description) {
    return { heading: trans.heading, description: trans.description };
  }

  return { heading: newsDoc.heading, description: newsDoc.description };
}
