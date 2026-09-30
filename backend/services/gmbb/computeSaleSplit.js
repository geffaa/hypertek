/**
 * computeSaleSplit — the one place a sale's proceeds get divided.
 *
 * Before this file existed, the same math was written out separately in
 * nftPurchaseService.js and nftController.js, and had drifted to disagree with
 * each other and with the live Terms of Service. This function is the single
 * source of truth both call sites now import instead of computing their own.
 *
 * Pure function. No DB, no express, no I/O — mirrors the existing pattern in
 * packagePricing.js.
 */

import {
  resolveGmbbBps,
  CREATOR_FIRST_SALE_PLATFORM_FEE_BPS,
  RESALE_SELLER_BPS,
  RESALE_ARTIST_ROYALTY_BPS,
  RESALE_GMBB_BPS,
} from "./gmbbConstants.js";

const bpsShare = (amount, bps) => Math.round((amount * bps) / 100) / 100; // 2-decimal money

/**
 * @param {Object} input
 * @param {"platform-first-sale"|"creator-first-sale"|"resale"} input.saleType
 * @param {number} input.salePrice        Sale price in USD.
 * @param {number} [input.gmbbBps]        GMBB percentage chosen at listing, in
 *                                        basis points. Required for the two
 *                                        first-sale types, ignored for resale
 *                                        (which always adds a flat 5%).
 * @returns {{ sellerReceived: number, royaltyPaid: number, buybackAmount: number, platformFee: number }}
 *          The four shares always sum exactly to `salePrice` — one share in
 *          each branch is the remainder, not independently rounded, so the
 *          total can never drift by a cent.
 */
export function computeSaleSplit({ saleType, salePrice, gmbbBps }) {
  const price = Number(salePrice);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`computeSaleSplit: invalid salePrice ${salePrice}`);
  }

  switch (saleType) {
    case "platform-first-sale": {
      // Hyper Tek 100 is both seller and platform on its own first sales.
      // No separate commission line and no artist royalty — per Don:
      // "On the first sale from us, there is no royalty."
      const bps = resolveGmbbBps(gmbbBps, { isPlatformListing: true });
      const buybackAmount = bpsShare(price, bps);
      const sellerReceived = round2(price - buybackAmount);
      return { sellerReceived, royaltyPaid: 0, buybackAmount, platformFee: 0 };
    }

    case "creator-first-sale": {
      // Flat 8% platform commission no matter what GMBB percentage the
      // creator chose. Creator is the seller, so no separate artist royalty.
      const bps = resolveGmbbBps(gmbbBps, { isPlatformListing: false });
      const platformFee = bpsShare(price, CREATOR_FIRST_SALE_PLATFORM_FEE_BPS);
      const buybackAmount = bpsShare(price, bps);
      const sellerReceived = round2(price - platformFee - buybackAmount);
      return { sellerReceived, royaltyPaid: 0, buybackAmount, platformFee };
    }

    case "resale": {
      // Fixed 86/5/2/7 split. Platform fee is the remainder so the four
      // shares always sum exactly to the sale price.
      const sellerReceived = bpsShare(price, RESALE_SELLER_BPS);
      const buybackAmount = bpsShare(price, RESALE_GMBB_BPS);
      const royaltyPaid = bpsShare(price, RESALE_ARTIST_ROYALTY_BPS);
      const platformFee = round2(price - sellerReceived - buybackAmount - royaltyPaid);
      return { sellerReceived, royaltyPaid, buybackAmount, platformFee };
    }

    default:
      throw new Error(`computeSaleSplit: unknown saleType "${saleType}"`);
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * computeRewardPackSplit — GMBB funding for a package-reward item.
 *
 * Not a percentage-of-price scenario like the ones above: a reward item was
 * never individually priced (it arrives bundled with HB, resources, whatever
 * else is in the pack), so there is no "sale price" to take a cut of. Instead
 * the admin sets a fixed dollar target for that item when the package is
 * built — Don, 12 Sep 2026: "a portion goes to the GMBB fund first and
 * foremost, and then the rest of the funds that are left are ours." Same
 * shape as the old Scenario A preset-dollar mechanism, and the same rule: no
 * artist royalty on an item Hyper Tek minted and is giving away itself.
 *
 * @param {Object} input
 * @param {number} input.packagePriceUSD  What the buyer paid for the whole package.
 * @param {number} input.gmbbTargetUSD    Fixed dollar figure the admin set for this item.
 * @returns {{ buybackAmount: number, companyAmount: number }}
 *          The two shares always sum exactly to packagePriceUSD.
 */
export function computeRewardPackSplit({ packagePriceUSD, gmbbTargetUSD }) {
  const price = Number(packagePriceUSD);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`computeRewardPackSplit: invalid packagePriceUSD ${packagePriceUSD}`);
  }
  const target = Number(gmbbTargetUSD) || 0;
  if (target < 0) throw new Error(`computeRewardPackSplit: invalid gmbbTargetUSD ${gmbbTargetUSD}`);

  const buybackAmount = round2(Math.min(target, price));
  const companyAmount = round2(price - buybackAmount);
  return { buybackAmount, companyAmount };
}
