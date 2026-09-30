// Tests for executeBuyback — the live path that actually sends a user the money
// behind the guaranteed minimum buy-back.
//
// What matters here is not the arithmetic (that lives in computeSaleSplit) but
// that money moves exactly once: two admins clicking the same approve button
// must not both pay, and a failed transfer must not leave an item retired with
// its balance wiped and nothing sent.

import { jest } from "@jest/globals";

const dispatchRoyalty = jest.fn();

jest.unstable_mockModule("../services/RoyaltyService.js", () => ({
  dispatchRoyalty,
  RoyaltyPayout: {},
  dispatchRoyaltyOnChain: jest.fn(),
  dispatchRoyaltyViaStripe: jest.fn(),
}));

// A tiny stand-in for the NFTSystem model: one in-memory document, with
// findOneAndUpdate honouring its filter so the claim-once behaviour is real
// rather than assumed.
let doc;

const NFTSystem = {
  findById: jest.fn(async (id) => (doc && String(doc._id) === String(id) ? { ...doc } : null)),

  findOneAndUpdate: jest.fn(async (filter, update) => {
    if (!doc || String(doc._id) !== String(filter._id)) return null;
    if (filter.zeroed && filter.zeroed.$ne === true && doc.zeroed === true) return null;
    doc = { ...doc, ...update };
    return { ...doc };
  }),

  findByIdAndUpdate: jest.fn(async (id, update) => {
    if (!doc || String(doc._id) !== String(id)) return null;
    doc = { ...doc, ...update };
    return { ...doc };
  }),
};

jest.unstable_mockModule("../Models/NFTSystem.js", () => ({ default: NFTSystem }));

const { executeBuyback } = await import("../services/NFAService.js");

function seed(overrides = {}) {
  doc = {
    _id: "item1",
    owner: "0xowner",
    minimumBuybackUSD: 100,
    buybackPending: true,
    zeroed: false,
    removedFromCirculation: false,
    listed: true,
    status: "active",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  dispatchRoyalty.mockResolvedValue({ ok: true });
  // Payout mechanics tests below exercise executeBuyback with the freeze
  // switch off. The switch itself is tested separately.
  process.env.GMBB_BUYBACK_LOCKED = "false";
  seed();
});

describe("the freeze switch", () => {
  it("defaults to locked when the env var is unset", async () => {
    delete process.env.GMBB_BUYBACK_LOCKED;
    await expect(executeBuyback("item1")).rejects.toThrow(/switched off/i);
    expect(dispatchRoyalty).not.toHaveBeenCalled();
  });

  it("refuses even a valid payout while locked", async () => {
    process.env.GMBB_BUYBACK_LOCKED = "true";
    await expect(executeBuyback("item1")).rejects.toThrow(/switched off/i);
  });
});

describe("the happy path", () => {
  it("pays the owner and retires the item", async () => {
    const result = await executeBuyback("item1");

    expect(dispatchRoyalty).toHaveBeenCalledTimes(1);
    expect(dispatchRoyalty.mock.calls[0][0]).toMatchObject({
      creatorWallet: "0xowner",
      amount: 100,
      saleRecordId: "buyback_item1",
    });

    expect(result.payoutAmount).toBe(100);
    expect(result.ownerWallet).toBe("0xowner");
    expect(doc.zeroed).toBe(true);
    expect(doc.removedFromCirculation).toBe(true);
    expect(doc.buybackPending).toBe(false);
  });

  it("clears the tracked balance so it cannot be read and paid again", async () => {
    await executeBuyback("item1");
    expect(doc.minimumBuybackUSD).toBe(0);
    expect(doc.buybackPayoutId).toBe("buyback_item1");
    expect(doc.buybackPaidAt).toBeInstanceOf(Date);
  });
});

describe("it pays only once", () => {
  it("refuses a second call on an item already bought back", async () => {
    await executeBuyback("item1");
    await expect(executeBuyback("item1")).rejects.toThrow(/already been bought back/i);
    expect(dispatchRoyalty).toHaveBeenCalledTimes(1);
  });

  it("lets only one of two concurrent calls reach the payout", async () => {
    // Both read the document before either has written, which is exactly what
    // two admins clicking at the same moment looks like.
    const results = await Promise.allSettled([executeBuyback("item1"), executeBuyback("item1")]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(dispatchRoyalty).toHaveBeenCalledTimes(1);
    expect(doc.minimumBuybackUSD).toBe(0);
  });
});

describe("when the payment fails", () => {
  beforeEach(() => {
    dispatchRoyalty.mockRejectedValue(new Error("insufficient USDC in payout wallet"));
  });

  it("throws instead of reporting success", async () => {
    await expect(executeBuyback("item1")).rejects.toThrow(/payout failed/i);
  });

  it("puts the item back exactly as it was, balance included", async () => {
    await expect(executeBuyback("item1")).rejects.toThrow();

    expect(doc.zeroed).toBe(false);
    expect(doc.removedFromCirculation).toBe(false);
    expect(doc.minimumBuybackUSD).toBe(100);
    expect(doc.status).toBe("active");
    expect(doc.buybackPaidAt).toBeNull();
    expect(doc.buybackPayoutId).toBeNull();
  });

  it("leaves the item claimable again once the payout problem is fixed", async () => {
    await expect(executeBuyback("item1")).rejects.toThrow();

    dispatchRoyalty.mockResolvedValue({ ok: true });
    const result = await executeBuyback("item1");

    expect(result.payoutAmount).toBe(100);
    expect(doc.zeroed).toBe(true);
  });
});

describe("nothing payable", () => {
  it("refuses an item with no balance rather than retiring it for free", async () => {
    seed({ minimumBuybackUSD: 0 });
    await expect(executeBuyback("item1")).rejects.toThrow(/nothing payable/i);
    expect(doc.zeroed).toBe(false);
    expect(dispatchRoyalty).not.toHaveBeenCalled();
  });

  it("refuses a platform-held item with no real owner wallet", async () => {
    seed({ owner: "admin" });
    await expect(executeBuyback("item1")).rejects.toThrow(/nothing payable/i);
    expect(doc.zeroed).toBe(false);
  });

  it("refuses an item that does not exist", async () => {
    await expect(executeBuyback("missing")).rejects.toThrow(/not found/i);
  });
});
