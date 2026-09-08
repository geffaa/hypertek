// Unit tests for computeSaleSplit — the single source of truth for how a sale's
// proceeds are divided, replacing what used to be separate, drifted math in
// nftPurchaseService.js and nftController.js.
//
// The invariant that matters most: the four shares always sum exactly to the
// sale price. A cent lost or invented here either shorts a seller or breaks
// the sales-history reconciliation an accountant will eventually check.

import { computeSaleSplit } from "../services/gmbb/computeSaleSplit.js";
import {
  CREATOR_GMBB_MIN_BPS,
  CREATOR_GMBB_MAX_BPS,
  PLATFORM_GMBB_MIN_BPS,
  PLATFORM_GMBB_MAX_BPS,
  clampGmbbBps,
} from "../services/gmbb/gmbbConstants.js";

function expectExactSum(split, salePrice) {
  const total = split.sellerReceived + split.royaltyPaid + split.buybackAmount + split.platformFee;
  expect(Math.round(total * 100)).toBe(Math.round(salePrice * 100));
}

describe("computeSaleSplit — resale", () => {
  it("splits 86/5/2/7 exactly on a round number", () => {
    const split = computeSaleSplit({ saleType: "resale", salePrice: 1000 });
    expect(split).toEqual({
      sellerReceived: 860,
      buybackAmount: 50,
      royaltyPaid: 20,
      platformFee: 70,
    });
    expectExactSum(split, 1000);
  });

  it("sums exactly even on an awkward, non-round price", () => {
    for (const price of [33.33, 1.01, 9999.99, 0.07, 123.45]) {
      const split = computeSaleSplit({ saleType: "resale", salePrice: price });
      expectExactSum(split, price);
    }
  });

  it("ignores gmbbBps entirely — resale's GMBB share is always the flat 5%", () => {
    const a = computeSaleSplit({ saleType: "resale", salePrice: 1000, gmbbBps: 2000 });
    const b = computeSaleSplit({ saleType: "resale", salePrice: 1000, gmbbBps: 9000 });
    expect(a.buybackAmount).toBe(50);
    expect(b.buybackAmount).toBe(50);
  });
});

describe("computeSaleSplit — creator first sale", () => {
  it("takes a flat 8% platform fee regardless of the chosen GMBB percentage", () => {
    const split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 2000 }); // 20%
    expect(split.platformFee).toBe(80);
    expect(split.buybackAmount).toBe(200);
    expect(split.sellerReceived).toBe(720); // 1000 - 80 - 200
    expect(split.royaltyPaid).toBe(0); // creator is the seller, no separate royalty
    expectExactSum(split, 1000);
  });

  it("matches the two worked examples already agreed with Don", () => {
    // 20% GMBB: seller gets 92% - 20% = 72%
    let split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1_000_000, gmbbBps: 2000 });
    expect(split.sellerReceived).toBe(720_000);
    expect(split.buybackAmount).toBe(200_000);
    expect(split.platformFee).toBe(80_000);

    // 70% GMBB: seller gets 92% - 70% = 22%
    split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1_000_000, gmbbBps: 7000 });
    expect(split.sellerReceived).toBe(220_000);
    expect(split.buybackAmount).toBe(700_000);
    expect(split.platformFee).toBe(80_000);
  });

  it("sums exactly at both ends of the allowed GMBB range", () => {
    for (const bps of [CREATOR_GMBB_MIN_BPS, CREATOR_GMBB_MAX_BPS]) {
      const split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 777.77, gmbbBps: bps });
      expectExactSum(split, 777.77);
    }
  });

  it("clamps an out-of-range GMBB percentage rather than producing a nonsense split", () => {
    const tooLow = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 500 }); // 5%, below the 20% floor
    expect(tooLow.buybackAmount).toBe(200); // clamped to 20%

    const tooHigh = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 9999 }); // above 70% ceiling
    expect(tooHigh.buybackAmount).toBe(700); // clamped to 70%
  });
});

describe("computeSaleSplit — platform (Hyper Tek 100) first sale", () => {
  it("has no royalty and no separate platform fee — seller and platform are the same party", () => {
    const split = computeSaleSplit({ saleType: "platform-first-sale", salePrice: 1_000_000, gmbbBps: 5000 });
    expect(split.royaltyPaid).toBe(0);
    expect(split.platformFee).toBe(0);
    expect(split.buybackAmount).toBe(500_000);
    expect(split.sellerReceived).toBe(500_000);
    expectExactSum(split, 1_000_000);
  });

  it("matches Don's own $1,000,000 / 50% worked example exactly", () => {
    const split = computeSaleSplit({ saleType: "platform-first-sale", salePrice: 1_000_000, gmbbBps: 5000 });
    expect(split.buybackAmount).toBe(500_000);
    expect(split.sellerReceived).toBe(500_000);
  });

  it("sums exactly at both ends of the admin allowed range", () => {
    for (const bps of [PLATFORM_GMBB_MIN_BPS, PLATFORM_GMBB_MAX_BPS]) {
      const split = computeSaleSplit({ saleType: "platform-first-sale", salePrice: 54321.99, gmbbBps: bps });
      expectExactSum(split, 54321.99);
    }
  });
});

describe("computeSaleSplit — input validation", () => {
  it("rejects an unknown sale type rather than silently returning zeros", () => {
    expect(() => computeSaleSplit({ saleType: "bogus", salePrice: 100 })).toThrow();
  });

  it("rejects a negative or non-numeric price", () => {
    expect(() => computeSaleSplit({ saleType: "resale", salePrice: -1 })).toThrow();
    expect(() => computeSaleSplit({ saleType: "resale", salePrice: NaN })).toThrow();
  });
});

describe("clampGmbbBps", () => {
  it("clamps to the creator range by default", () => {
    expect(clampGmbbBps(1000, { isPlatformListing: false })).toBe(CREATOR_GMBB_MIN_BPS);
    expect(clampGmbbBps(8000, { isPlatformListing: false })).toBe(CREATOR_GMBB_MAX_BPS);
    expect(clampGmbbBps(3500, { isPlatformListing: false })).toBe(3500);
  });

  it("clamps to the platform range when isPlatformListing is true", () => {
    expect(clampGmbbBps(1000, { isPlatformListing: true })).toBe(PLATFORM_GMBB_MIN_BPS);
    expect(clampGmbbBps(9999, { isPlatformListing: true })).toBe(PLATFORM_GMBB_MAX_BPS);
  });

  it("falls back to the documented default instead of NaN when bps is null/undefined", () => {
    expect(clampGmbbBps(null, { isPlatformListing: false })).toBe(3500);
    expect(clampGmbbBps(undefined, { isPlatformListing: false })).toBe(3500);
    expect(clampGmbbBps(null, { isPlatformListing: true })).toBe(3500);
  });
});

describe("computeSaleSplit — unset gmbbBps (the real-world case today)", () => {
  it("falls back cleanly instead of producing NaN shares", () => {
    const split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: null });
    expect(split.buybackAmount).toBe(350); // 35% default
    expectExactSum(split, 1000);
  });
});
