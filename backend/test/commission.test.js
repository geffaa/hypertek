// Unit tests for the calculatePaymentDistribution logic
// Pure function extracted from Controllers/nftController.js — no DB dependencies

function calculatePaymentDistribution(priceETH, isFirstSale, creatorWallet, sellerWallet, isNFA = false) {
  const platformWallet = "0xPLATFORM";

  let distribution = {
    sellerAmount:   0,
    creatorAmount:  0,
    platformAmount: 0,
    buybackAmount:  0,
    companyAmount:  0,
    payments: [],
  };

  if (isFirstSale) {
    distribution.creatorAmount = priceETH;
    distribution.payments.push({
      recipient: creatorWallet,
      amount:     priceETH,
      percentage: 100,
      type:       "creator_first_sale",
    });
  } else if (isNFA) {
    // NFA: seller 80% | artist 4% | buyback 5% | company 11% — all from total price
    // The 20% platform split is: 4% artist + 5% buyback + 11% company = 20%
    distribution.sellerAmount   = parseFloat((priceETH * 0.80).toFixed(6));
    distribution.creatorAmount  = parseFloat((priceETH * 0.04).toFixed(6));
    distribution.buybackAmount  = parseFloat((priceETH * 0.05).toFixed(6));
    distribution.companyAmount  = parseFloat((priceETH * 0.11).toFixed(6));
    distribution.platformAmount = parseFloat((priceETH * 0.20).toFixed(6));

    distribution.payments.push(
      { recipient: sellerWallet,   amount: distribution.sellerAmount,   percentage: 80, type: "seller_proceeds" },
      { recipient: creatorWallet,  amount: distribution.creatorAmount,  percentage: 4,  type: "artist_royalty"  },
      { recipient: "buyback_fund", amount: distribution.buybackAmount,  percentage: 5,  type: "buyback_fund"    },
      { recipient: platformWallet, amount: distribution.companyAmount,  percentage: 11, type: "company_account" },
    );
  } else {
    // NFC: seller 80% | creator 4% | company 16% — all from total price
    distribution.sellerAmount   = parseFloat((priceETH * 0.80).toFixed(6));
    distribution.creatorAmount  = parseFloat((priceETH * 0.04).toFixed(6));
    distribution.companyAmount  = parseFloat((priceETH * 0.16).toFixed(6));
    distribution.platformAmount = parseFloat((priceETH * 0.20).toFixed(6));

    distribution.payments.push(
      { recipient: sellerWallet,   amount: distribution.sellerAmount,   percentage: 80, type: "seller_proceeds" },
      { recipient: creatorWallet,  amount: distribution.creatorAmount,  percentage: 4,  type: "creator_royalty" },
      { recipient: platformWallet, amount: distribution.companyAmount,  percentage: 16, type: "company_account" },
    );
  }

  return distribution;
}

// ────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────

describe("calculatePaymentDistribution", () => {
  const CREATOR  = "0xCREATOR";
  const SELLER   = "0xSELLER";
  const PLATFORM = "0xPLATFORM";

  // ── First sale ──────────────────────────────────────────────────
  describe("First sale", () => {
    test("100% goes to creator on first sale", () => {
      const dist = calculatePaymentDistribution(1.0, true, CREATOR, SELLER);
      expect(dist.creatorAmount).toBe(1.0);
      expect(dist.sellerAmount).toBe(0);
      expect(dist.platformAmount).toBe(0);
      expect(dist.payments).toHaveLength(1);
      expect(dist.payments[0].type).toBe("creator_first_sale");
      expect(dist.payments[0].percentage).toBe(100);
      expect(dist.payments[0].recipient).toBe(CREATOR);
    });

    test("First sale percentages sum to 100", () => {
      const dist = calculatePaymentDistribution(5.0, true, CREATOR, SELLER);
      const total = dist.payments.reduce((sum, p) => sum + p.percentage, 0);
      expect(total).toBe(100);
    });

    test("First sale with zero price", () => {
      const dist = calculatePaymentDistribution(0, true, CREATOR, SELLER);
      expect(dist.creatorAmount).toBe(0);
      expect(dist.payments[0].amount).toBe(0);
    });
  });

  // ── NFA secondary sale ──────────────────────────────────────────
  describe("NFA secondary sale", () => {
    test("NFA: seller 80% + artist 4% + buyback 5% + company 11% = 100%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      const total = dist.payments.reduce((sum, p) => sum + p.percentage, 0);
      expect(total).toBe(100);
    });

    test("NFA: creator gets 4%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      expect(dist.creatorAmount).toBeCloseTo(0.04, 6);
    });

    test("NFA: buyback fund gets 5%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      expect(dist.buybackAmount).toBeCloseTo(0.05, 6);
    });

    test("NFA: company gets 11%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      expect(dist.companyAmount).toBeCloseTo(0.11, 6);
    });

    test("NFA: seller gets 80%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      expect(dist.sellerAmount).toBeCloseTo(0.80, 6);
    });

    test("NFA: buyback amount = price * 0.05", () => {
      const price = 2.0;
      const dist = calculatePaymentDistribution(price, false, CREATOR, SELLER, true);
      expect(dist.buybackAmount).toBeCloseTo(price * 0.05, 6);
    });

    test("NFA: correct payment types in payments array", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      const types = dist.payments.map((p) => p.type);
      expect(types).toContain("artist_royalty");
      expect(types).toContain("buyback_fund");
      expect(types).toContain("company_account");
      expect(types).toContain("seller_proceeds");
    });

    test("NFA: buyback_fund recipient is 'buyback_fund'", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      const buyback = dist.payments.find((p) => p.type === "buyback_fund");
      expect(buyback.recipient).toBe("buyback_fund");
    });

    test("NFA: 4 payment entries", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, true);
      expect(dist.payments).toHaveLength(4);
    });

    test("NFA large price: 100000 — percentages still sum to 100", () => {
      const dist = calculatePaymentDistribution(100000, false, CREATOR, SELLER, true);
      const total = dist.payments.reduce((sum, p) => sum + p.percentage, 0);
      expect(total).toBe(100);
    });

    test("NFA large price: 100000 — buyback = 5000", () => {
      const dist = calculatePaymentDistribution(100000, false, CREATOR, SELLER, true);
      expect(dist.buybackAmount).toBeCloseTo(5000, 4);
    });

    test("NFA zero price edge case", () => {
      const dist = calculatePaymentDistribution(0, false, CREATOR, SELLER, true);
      expect(dist.creatorAmount).toBe(0);
      expect(dist.buybackAmount).toBe(0);
      expect(dist.sellerAmount).toBe(0);
    });
  });

  // ── NFC secondary sale ──────────────────────────────────────────
  describe("NFC secondary sale", () => {
    test("NFC: seller 80% + creator 4% + company 16% = 100%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      const total = dist.payments.reduce((sum, p) => sum + p.percentage, 0);
      expect(total).toBe(100);
    });

    test("NFC: creator gets 4%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      expect(dist.creatorAmount).toBeCloseTo(0.04, 6);
    });

    test("NFC: company gets 16%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      expect(dist.companyAmount).toBeCloseTo(0.16, 6);
    });

    test("NFC: seller gets 80%", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      expect(dist.sellerAmount).toBeCloseTo(0.80, 6);
    });

    test("NFC: no buyback amount", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      expect(dist.buybackAmount).toBe(0);
    });

    test("NFC: 3 payment entries", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      expect(dist.payments).toHaveLength(3);
    });

    test("NFC: correct payment types", () => {
      const dist = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      const types = dist.payments.map((p) => p.type);
      expect(types).toContain("creator_royalty");
      expect(types).toContain("company_account");
      expect(types).toContain("seller_proceeds");
    });

    test("NFC large price: 100000 — percentages sum to 100", () => {
      const dist = calculatePaymentDistribution(100000, false, CREATOR, SELLER, false);
      const total = dist.payments.reduce((sum, p) => sum + p.percentage, 0);
      expect(total).toBe(100);
    });

    test("NFC zero price edge case", () => {
      const dist = calculatePaymentDistribution(0, false, CREATOR, SELLER, false);
      expect(dist.creatorAmount).toBe(0);
      expect(dist.companyAmount).toBe(0);
      expect(dist.sellerAmount).toBe(0);
    });
  });

  // ── isNFA defaults to false ──────────────────────────────────────
  describe("Default isNFA parameter", () => {
    test("isNFA defaults to false — behaves like NFC", () => {
      const distNFC     = calculatePaymentDistribution(1.0, false, CREATOR, SELLER, false);
      const distDefault = calculatePaymentDistribution(1.0, false, CREATOR, SELLER);
      expect(distDefault.creatorAmount).toBe(distNFC.creatorAmount);
      expect(distDefault.companyAmount).toBe(distNFC.companyAmount);
      expect(distDefault.sellerAmount).toBe(distNFC.sellerAmount);
    });
  });
});
