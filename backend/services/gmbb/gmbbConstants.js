/**
 * GMBB commission constants — the one place these numbers live.
 *
 * They have already changed three times over the life of this project (20-35%,
 * then 20-70%/35-90%, then the flat commission moving from 20% to 14%/8%). Every
 * previous change meant hunting through several files. This file exists so the
 * next change is a one-line edit here instead.
 *
 * All values in basis points (1% = 100 bps), matching the on-chain convention.
 */

// GMBB percentage a lister may choose at listing time, per the live Terms of
// Service (Section 10, "GMBB Contributions").
export const CREATOR_GMBB_MIN_BPS = 2000; // 20%
export const CREATOR_GMBB_MAX_BPS = 7000; // 70%
// The only default value Don explicitly confirmed ("automatic 35% will be applied"
// if the lister sets nothing) was agreed before the ceiling was later widened from
// 35% to 70%. Using it here as the safest documented value, but this specific
// number is worth re-confirming with Don now that the range has moved — flagging
// rather than silently carrying it forward.
export const CREATOR_GMBB_DEFAULT_BPS = 3500; // 35% — CONFIRM this is still current

export const PLATFORM_GMBB_MIN_BPS = 3500; // 35%
export const PLATFORM_GMBB_MAX_BPS = 9000; // 90%
// No platform-listing default was ever confirmed by Don separately from the
// 35% creator default — using the range floor until a listing-time picker
// UI exists for admin listings too.
export const PLATFORM_GMBB_DEFAULT_BPS = 3500; // 35%

// Flat platform commission on a creator's first sale of their own item. Not
// affected by whatever GMBB percentage they chose.
export const CREATOR_FIRST_SALE_PLATFORM_FEE_BPS = 800; // 8%

// Resale (second sale onward) split. Must sum to 10000.
export const RESALE_SELLER_BPS = 8600; // 86%
export const RESALE_ARTIST_ROYALTY_BPS = 200; // 2%
export const RESALE_GMBB_BPS = 500; // 5%
export const RESALE_PLATFORM_FEE_BPS = 700; // 7%

/**
 * Clamp a lister-chosen GMBB bps value into the allowed range for who is
 * listing. Out-of-range input is corrected, not rejected, since the UI should
 * already be preventing it — this is the backend's own floor, not a duplicate
 * of client-side validation.
 *
 * `bps` is null/undefined for essentially every existing item today (the
 * schema field was only just added and no picker UI sets it yet) — that case
 * falls back to the documented default rather than clamping NaN.
 */
export function clampGmbbBps(bps, { isPlatformListing }) {
  const [min, max, fallback] = isPlatformListing
    ? [PLATFORM_GMBB_MIN_BPS, PLATFORM_GMBB_MAX_BPS, PLATFORM_GMBB_DEFAULT_BPS]
    : [CREATOR_GMBB_MIN_BPS, CREATOR_GMBB_MAX_BPS, CREATOR_GMBB_DEFAULT_BPS];
  const value = bps == null ? fallback : Math.trunc(bps);
  return Math.min(Math.max(value, min), max);
}
