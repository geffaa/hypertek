// Unit tests for HB cashout logic
// Pure functions — no DB dependencies

const HB_TO_USD = 250;          // 250 HB = $1 USD
const MIN_USDC_CASHOUT_HB = 250;  // $1 minimum for USDC cashout
const MIN_BANK_CASHOUT_HB = 2500; // $10 minimum for bank cashout

function validateCashout(balance, amount, method) {
  if (amount <= 0) return { valid: false, error: "Amount must be positive" };
  if (balance < amount) return { valid: false, error: "Insufficient HB balance" };
  if (method === "usdc" && amount < MIN_USDC_CASHOUT_HB)
    return { valid: false, error: `Minimum cashout is ${MIN_USDC_CASHOUT_HB} HB ($${MIN_USDC_CASHOUT_HB / HB_TO_USD})` };
  if (method === "bank" && amount < MIN_BANK_CASHOUT_HB)
    return { valid: false, error: `Minimum bank cashout is ${MIN_BANK_CASHOUT_HB} HB ($${MIN_BANK_CASHOUT_HB / HB_TO_USD})` };
  return { valid: true, usdAmount: amount / HB_TO_USD };
}

function calculateHBToUSD(hbAmount) {
  return parseFloat((hbAmount / HB_TO_USD).toFixed(2));
}

// ────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────

describe("HB to USD Conversion", () => {
  test("250 HB = $1.00", () => {
    expect(calculateHBToUSD(250)).toBe(1.00);
  });

  test("2500 HB = $10.00", () => {
    expect(calculateHBToUSD(2500)).toBe(10.00);
  });

  test("1000 HB = $4.00", () => {
    expect(calculateHBToUSD(1000)).toBe(4.00);
  });

  test("500 HB = $2.00", () => {
    expect(calculateHBToUSD(500)).toBe(2.00);
  });

  test("125 HB = $0.50", () => {
    expect(calculateHBToUSD(125)).toBe(0.50);
  });

  test("0 HB = $0.00", () => {
    expect(calculateHBToUSD(0)).toBe(0.00);
  });

  test("1 HB = $0.00 (rounds to 2 decimal places)", () => {
    expect(calculateHBToUSD(1)).toBe(0.00);
  });

  test("10000 HB = $40.00", () => {
    expect(calculateHBToUSD(10000)).toBe(40.00);
  });
});

describe("validateCashout — USDC method", () => {
  test("Valid USDC cashout at exact minimum (250 HB)", () => {
    const result = validateCashout(1000, 250, "usdc");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(1.0);
  });

  test("Valid USDC cashout above minimum", () => {
    const result = validateCashout(5000, 1000, "usdc");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(4.0);
  });

  test("Invalid USDC cashout — below minimum (249 HB)", () => {
    const result = validateCashout(1000, 249, "usdc");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Minimum cashout is 250 HB/);
  });

  test("Invalid USDC cashout — below minimum (1 HB)", () => {
    const result = validateCashout(1000, 1, "usdc");
    expect(result.valid).toBe(false);
  });

  test("USDC cashout — usdAmount is correctly calculated", () => {
    const result = validateCashout(10000, 2500, "usdc");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(10.0);
  });
});

describe("validateCashout — bank method", () => {
  test("Valid bank cashout at exact minimum (2500 HB)", () => {
    const result = validateCashout(5000, 2500, "bank");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(10.0);
  });

  test("Valid bank cashout above minimum", () => {
    const result = validateCashout(10000, 5000, "bank");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(20.0);
  });

  test("Invalid bank cashout — below minimum (2499 HB)", () => {
    const result = validateCashout(5000, 2499, "bank");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Minimum bank cashout is 2500 HB/);
  });

  test("Invalid bank cashout — 250 HB (meets usdc min but not bank min)", () => {
    const result = validateCashout(5000, 250, "bank");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Minimum bank cashout is 2500 HB/);
  });

  test("Bank cashout — usdAmount is correctly calculated", () => {
    const result = validateCashout(10000, 7500, "bank");
    expect(result.valid).toBe(true);
    expect(result.usdAmount).toBe(30.0);
  });
});

describe("validateCashout — insufficient balance", () => {
  test("Fails when balance < amount (USDC)", () => {
    const result = validateCashout(200, 250, "usdc");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Insufficient HB balance");
  });

  test("Fails when balance < amount (bank)", () => {
    const result = validateCashout(2000, 2500, "bank");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Insufficient HB balance");
  });

  test("Succeeds when balance exactly equals amount", () => {
    const result = validateCashout(2500, 2500, "bank");
    expect(result.valid).toBe(true);
  });

  test("Fails with zero balance", () => {
    const result = validateCashout(0, 250, "usdc");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Insufficient HB balance");
  });
});

describe("validateCashout — invalid amounts", () => {
  test("Fails with zero amount", () => {
    const result = validateCashout(1000, 0, "usdc");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must be positive");
  });

  test("Fails with negative amount", () => {
    const result = validateCashout(1000, -100, "usdc");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must be positive");
  });
});

describe("HB deduction after cashout", () => {
  function applyDeduction(balance, amount) {
    return balance - amount;
  }

  test("Balance correctly reduced after cashout", () => {
    expect(applyDeduction(5000, 250)).toBe(4750);
  });

  test("Balance zero after full cashout", () => {
    expect(applyDeduction(2500, 2500)).toBe(0);
  });

  test("Large cashout deduction", () => {
    expect(applyDeduction(100000, 50000)).toBe(50000);
  });
});

describe("Minimum constants", () => {
  test("USDC minimum is 250 HB = $1", () => {
    expect(MIN_USDC_CASHOUT_HB).toBe(250);
    expect(calculateHBToUSD(MIN_USDC_CASHOUT_HB)).toBe(1.00);
  });

  test("Bank minimum is 2500 HB = $10", () => {
    expect(MIN_BANK_CASHOUT_HB).toBe(2500);
    expect(calculateHBToUSD(MIN_BANK_CASHOUT_HB)).toBe(10.00);
  });

  test("HB_TO_USD rate is 250", () => {
    expect(HB_TO_USD).toBe(250);
  });
});
