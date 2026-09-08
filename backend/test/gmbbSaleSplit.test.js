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
  resolveGmbbBps,
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

  it("refuses an out-of-range GMBB percentage instead of settling at a different one", () => {
    // This used to clamp: 5% quietly became 20%, and anything above the ceiling
    // quietly became 70%. Either way the item settled under terms nobody chose.
    expect(() =>
      computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 500 }),
    ).toThrow(/range/i);
    expect(() =>
      computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 9999 }),
    ).toThrow(/range/i);
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

// Settlement must not quietly substitute a percentage the item was not listed
// under. It used to clamp instead, which turned a percentage passed in place of
// basis points into a silently underfunded guarantee, and let NaN through into
// the money arithmetic. Audit finding 8.
describe("resolveGmbbBps", () => {
  it("accepts a valid value inside the creator range and returns it untouched", () => {
    expect(resolveGmbbBps(CREATOR_GMBB_MIN_BPS, { isPlatformListing: false })).toBe(CREATOR_GMBB_MIN_BPS);
    expect(resolveGmbbBps(CREATOR_GMBB_MAX_BPS, { isPlatformListing: false })).toBe(CREATOR_GMBB_MAX_BPS);
    expect(resolveGmbbBps(3500, { isPlatformListing: false })).toBe(3500);
  });

  it("accepts a valid value inside the wider platform range", () => {
    expect(resolveGmbbBps(PLATFORM_GMBB_MIN_BPS, { isPlatformListing: true })).toBe(PLATFORM_GMBB_MIN_BPS);
    expect(resolveGmbbBps(PLATFORM_GMBB_MAX_BPS, { isPlatformListing: true })).toBe(PLATFORM_GMBB_MAX_BPS);
  });

  it("falls back to the documented default when nothing was chosen", () => {
    expect(resolveGmbbBps(null, { isPlatformListing: false })).toBe(3500);
    expect(resolveGmbbBps(undefined, { isPlatformListing: false })).toBe(3500);
    expect(resolveGmbbBps(null, { isPlatformListing: true })).toBe(3500);
  });

  it("rejects a percentage passed where basis points belong", () => {
    // 35 meaning 35% used to be read as 0.35% and lifted to the 20% floor.
    expect(() => resolveGmbbBps(35, { isPlatformListing: false })).toThrow(/percentage/i);
    expect(() => resolveGmbbBps(70, { isPlatformListing: false })).toThrow(/percentage/i);
    expect(() => resolveGmbbBps(100, { isPlatformListing: true })).toThrow(/percentage/i);
  });

  it("rejects NaN rather than letting it become NaN dollars", () => {
    expect(() => resolveGmbbBps(NaN, { isPlatformListing: false })).toThrow();
    expect(() => resolveGmbbBps(Infinity, { isPlatformListing: false })).toThrow();
    expect(() => resolveGmbbBps("3500", { isPlatformListing: false })).toThrow();
    expect(() => resolveGmbbBps(3500.5, { isPlatformListing: false })).toThrow();
  });

  it("rejects a value outside the range allowed for that lister", () => {
    expect(() => resolveGmbbBps(1000, { isPlatformListing: false })).toThrow(/range/i);
    expect(() => resolveGmbbBps(8000, { isPlatformListing: false })).toThrow(/range/i);
    expect(() => resolveGmbbBps(9999, { isPlatformListing: true })).toThrow(/range/i);
    // 2000 is valid for a creator but below the platform floor of 3500.
    expect(() => resolveGmbbBps(2000, { isPlatformListing: true })).toThrow(/range/i);
  });

  it("stops the sale rather than settling it wrong, all the way through computeSaleSplit", () => {
    expect(() =>
      computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: 35 }),
    ).toThrow(/percentage/i);
    expect(() =>
      computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: NaN }),
    ).toThrow();
  });
});

describe("computeSaleSplit — unset gmbbBps (the real-world case today)", () => {
  it("falls back cleanly instead of producing NaN shares", () => {
    const split = computeSaleSplit({ saleType: "creator-first-sale", salePrice: 1000, gmbbBps: null });
    expect(split.buybackAmount).toBe(350); // 35% default
    expectExactSum(split, 1000);
  });
});
