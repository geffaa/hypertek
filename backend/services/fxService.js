// fxService — USD→AUD conversion for AU bank cashouts.
//
// HyperBucks are pegged 250 HB = $1 USD, but the platform Stripe account is AU and all
// bank/instant payouts settle in AUD. We therefore convert the USD-pegged value to AUD
// at payout time using a live mid-market rate (cached), with an env fallback.
//
// There is no Stripe cross-currency FX fee on the payout itself because both the platform
// balance and the connected account are AUD — this rate only governs how many AUD we owe
// for a given USD-pegged cashout. The platform bears the rate/timing spread.

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let _cache = { rate: null, fetchedAt: 0 };

function fallbackRate() {
  const v = parseFloat(process.env.USD_AUD_RATE_FALLBACK || "1.52");
  return Number.isFinite(v) && v > 0 ? v : 1.52;
}

// Optional markup the platform can keep on conversion (default 0 = pure mid-market).
function markup() {
  const v = parseFloat(process.env.USD_AUD_FX_MARKUP || "0");
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

async function fetchLiveRate() {
  // Public, key-less mid-market source; falls back on any failure.
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: ctrl.signal });
    const data = await res.json();
    const rate = data?.rates?.AUD;
    if (Number.isFinite(rate) && rate > 0) return rate;
    throw new Error("AUD rate missing in response");
  } finally {
    clearTimeout(t);
  }
}

/**
 * getUsdToAudRate — returns the effective USD→AUD rate (incl. optional markup).
 * Uses a 1h in-memory cache. Set USD_AUD_RATE_SOURCE=fixed to skip the live fetch.
 */
export async function getUsdToAudRate() {
  const source = (process.env.USD_AUD_RATE_SOURCE || "live").toLowerCase();
  if (source === "fixed") return fallbackRate() * (1 + markup());

  const now = Date.now();
  if (_cache.rate && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.rate * (1 + markup());
  }
  try {
    const live = await fetchLiveRate();
    _cache = { rate: live, fetchedAt: now };
    return live * (1 + markup());
  } catch (e) {
    console.warn("[fxService] live USD→AUD fetch failed, using fallback:", e.message);
    return fallbackRate() * (1 + markup());
  }
}

/**
 * convertUsdToAud — returns { rate, aud } for a USD amount, rounded to 2 dp (AUD is
 * a 2-decimal currency).
 */
export async function convertUsdToAud(usdAmount) {
  const rate = await getUsdToAudRate();
  const aud = Math.round(usdAmount * rate * 100) / 100;
  return { rate: Math.round(rate * 1e6) / 1e6, aud };
}
