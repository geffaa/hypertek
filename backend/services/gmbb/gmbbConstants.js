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
// Don, 9 Sep 2026: "I think we changed the amount to 50%... most of the things
// we will be doing will be at 50%." Re-confirmed after the ceiling moved from
// 35% to 70% — this replaces the old 35% default, which was only ever agreed
// back when 35% was also the maximum.
export const CREATOR_GMBB_DEFAULT_BPS = 5000; // 50%

export const PLATFORM_GMBB_MIN_BPS = 3500; // 35%
export const PLATFORM_GMBB_MAX_BPS = 9000; // 90%
// Same 50% default as the creator side (Don, 9 Sep 2026) — sits inside this
// range too (35-90%), so no separate platform-listing default was needed.
export const PLATFORM_GMBB_DEFAULT_BPS = 5000; // 50%

// Flat platform commission on a creator's first sale of their own item. Not
// affected by whatever GMBB percentage they chose.
export const CREATOR_FIRST_SALE_PLATFORM_FEE_BPS = 800; // 8%

// Resale (second sale onward) split. Must sum to 10000.
export const RESALE_SELLER_BPS = 8600; // 86%
export const RESALE_ARTIST_ROYALTY_BPS = 200; // 2%
export const RESALE_GMBB_BPS = 500; // 5%
export const RESALE_PLATFORM_FEE_BPS = 700; // 7%

/**
 * Resolve a lister-chosen GMBB value, in basis points, for whoever is listing.
 *
 * Unset (null/undefined) is the normal case today — the schema field was only
 * recently added and no picker UI writes it yet — and falls back to the
 * documented default. Anything else must be a valid bps figure, and is
 * rejected rather than corrected if it is not.
 *
 * Rejecting instead of clamping is the whole point. This runs inside
 * settlement, where quietly substituting a different percentage than the one
 * an item was listed under means paying the wrong amount into that item's
 * guarantee, and doing it invisibly. The most likely mistake is a percentage
 * reaching this in place of basis points: `35` meaning 35% would previously
 * have been read as 0.35% and lifted to the 20% floor, silently underfunding
 * the guarantee by more than half. A UI is free to clamp before it saves; by
 * the time money is being divided, an unrecognisable value has to stop the
 * sale rather than be guessed at.
 */
export function resolveGmbbBps(bps, { isPlatformListing }) {
  const [min, max, fallback] = isPlatformListing
    ? [PLATFORM_GMBB_MIN_BPS, PLATFORM_GMBB_MAX_BPS, PLATFORM_GMBB_DEFAULT_BPS]
    : [CREATOR_GMBB_MIN_BPS, CREATOR_GMBB_MAX_BPS, CREATOR_GMBB_DEFAULT_BPS];

  if (bps == null) return fallback;

  // NaN is the case worth spelling out: it is not null, so it used to pass
  // straight through and turn every share of the sale into NaN.
  if (typeof bps !== "number" || !Number.isFinite(bps) || !Number.isInteger(bps)) {
    throw new Error(`gmbbBps must be a whole number of basis points, got ${bps}`);
  }

  if (bps > 0 && bps <= 100) {
    throw new Error(
      `gmbbBps ${bps} looks like a percentage. Basis points are expected here: ` +
      `store 2000 for 20%, 3500 for 35%.`
    );
  }

  if (bps < min || bps > max) {
    throw new Error(
      `gmbbBps ${bps} is outside the allowed range for this listing (${min}-${max})`
    );
  }

  return bps;
}
