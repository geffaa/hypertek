// Unit tests for the package price allocation — pure logic, no DB.
//
// The invariants that matter, because breaking any of them means a buyer either pays
// the wrong total or a mint throws BELOW_RESERVE after their money is already gone:
//   1. allocations sum EXACTLY to the package price (no lost or invented cents)
//   2. no item is allocated below its own buyback floor
//   3. no item is allocated 0
//   4. the same input always produces the same output

import {
  allocatePackagePrices,
  computeDiscount,
  detectFloorDrift,
  toCents,
  fromCents,
} from "../services/packagePricing.js";

const item = (id, basePriceUSD, floorUSD = 0) => ({
  id,
  basePriceCents: toCents(basePriceUSD),
  floorCents: toCents(floorUSD),
});

/** Assert the three money invariants on a successful allocation. */
function expectSoundAllocation(result, packagePriceCents) {
  expect(result.ok).toBe(true);

  const total = result.allocations.reduce((s, a) => s + a.allocatedCents, 0);
  expect(total).toBe(packagePriceCents);

  for (const a of result.allocations) {
    expect(a.allocatedCents).toBeGreaterThanOrEqual(1);
    expect(a.allocatedCents).toBeGreaterThanOrEqual(a.floorCents);
  }
}

describe("toCents / fromCents", () => {
  it("round-trips ordinary money", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(100)).toBe(10000);
    expect(toCents(0.01)).toBe(1);
    expect(fromCents(1999)).toBe(19.99);
  });

  it("does not drift on values that are not exact in binary floating point", () => {
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004
    expect(toCents(29.97)).toBe(2997);
  });
});

describe("allocatePackagePrices — happy paths", () => {
  it("splits an even discount proportionally", () => {
    // three $100 items sold for $240 → $80 each
    const items = [item("a", 100), item("b", 100), item("c", 100)];
    const price = toCents(240);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    expect(res.allocations.map((a) => a.allocatedCents)).toEqual([8000, 8000, 8000]);
  });

  it("weights the discount by each item's own price", () => {
    // $300 + $100 sold for $200 → the pricier item absorbs 3x the discount
    const items = [item("big", 300), item("small", 100)];
    const price = toCents(200);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    const byId = Object.fromEntries(res.allocations.map((a) => [a.id, a.allocatedCents]));
    expect(byId.big).toBe(15000);
    expect(byId.small).toBe(5000);
  });

  it("sums to the exact cent when the split does not divide evenly", () => {
    // $99.99 over three equal items cannot divide evenly — 3333.33 each
    const items = [item("a", 100), item("b", 100), item("c", 100)];
    const price = toCents(99.99);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price); // the real assertion: total === 9999
    const cents = res.allocations.map((a) => a.allocatedCents).sort();
    expect(cents).toEqual([3333, 3333, 3333]);
  });

  it("distributes leftover pennies rather than dropping them", () => {
    // $10.00 over 3 items → 333.33 each, 1 cent left over
    const items = [item("a", 10), item("b", 10), item("c", 10)];
    const price = toCents(10);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    const cents = res.allocations.map((a) => a.allocatedCents).sort((x, y) => x - y);
    expect(cents).toEqual([333, 333, 334]); // 1000 exactly
  });

  it("handles a single item package", () => {
    const items = [item("solo", 500, 100)];
    const price = toCents(400);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    expect(res.allocations[0].allocatedCents).toBe(40000);
  });
});

describe("allocatePackagePrices — buyback floors", () => {
  it("pins an item to its floor and pushes the discount onto the others", () => {
    // $200 item with a $180 floor + $200 item with no floor, bundled at $300.
    // A naive 50/50 split would give the floored item $150 and blow up at mint time.
    const items = [item("floored", 200, 180), item("free", 200, 0)];
    const price = toCents(300);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    const byId = Object.fromEntries(res.allocations.map((a) => [a.id, a.allocatedCents]));
    expect(byId.floored).toBe(18000); // pinned at its floor, not 15000
    expect(byId.free).toBe(12000); // absorbs the rest of the discount
  });

  it("accepts a price sitting exactly on the combined floor", () => {
    const items = [item("a", 200, 100), item("b", 200, 100)];
    const price = toCents(200); // exactly 100 + 100
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    expect(res.allocations.every((a) => a.allocatedCents === 10000)).toBe(true);
  });

  it("rejects a price one cent under the combined floor", () => {
    const items = [item("a", 200, 100), item("b", 200, 100)];
    const res = allocatePackagePrices({ items, packagePriceCents: toCents(200) - 1 });

    expect(res.ok).toBe(false);
    expect(res.reason).toBe("BELOW_MIN");
    expect(res.minFeasibleCents).toBe(20000);
    expect(res.violations).toHaveLength(2);
  });

  it("reserves a cent for zero-floor items when computing the minimum", () => {
    // floors are $100 and $0 — the minimum is $100.01, not $100, because the
    // second item still has to be allocated something
    const items = [item("floored", 500, 100), item("free", 500, 0)];
    const res = allocatePackagePrices({ items, packagePriceCents: toCents(100) });

    expect(res.ok).toBe(false);
    expect(res.minFeasibleCents).toBe(10001);

    const ok = allocatePackagePrices({ items, packagePriceCents: 10001 });
    expectSoundAllocation(ok, 10001);
  });

  it("distributes the surplus when every item is pinned to its floor", () => {
    const items = [item("a", 100, 90), item("b", 100, 90)];
    const price = toCents(181); // floors total 180, one dollar spare
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
  });

  it("keeps a low-priced item above its disproportionately high floor", () => {
    // the $10 item guarantees $9 back; a proportional split of a big discount
    // would hand it well under that
    const items = [item("cheap", 10, 9), item("expensive", 1000, 0)];
    const price = toCents(300);
    const res = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(res, price);
    const byId = Object.fromEntries(res.allocations.map((a) => [a.id, a.allocatedCents]));
    expect(byId.cheap).toBeGreaterThanOrEqual(900);
  });
});

describe("allocatePackagePrices — rejections", () => {
  it("rejects an empty package", () => {
    const res = allocatePackagePrices({ items: [], packagePriceCents: 1000 });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("NO_ITEMS");
  });

  it("rejects a zero or negative price", () => {
    const items = [item("a", 100)];
    expect(allocatePackagePrices({ items, packagePriceCents: 0 }).reason).toBe("INVALID_PRICE");
    expect(allocatePackagePrices({ items, packagePriceCents: -500 }).reason).toBe("INVALID_PRICE");
  });

  it("rejects an item that has no price of its own to be proportional to", () => {
    const items = [item("priced", 100), item("unpriced", 0)];
    const res = allocatePackagePrices({ items, packagePriceCents: toCents(50) });

    expect(res.ok).toBe(false);
    expect(res.reason).toBe("ITEM_WITHOUT_PRICE");
    expect(res.violations[0].id).toBe("unpriced");
  });
});

describe("allocatePackagePrices — determinism", () => {
  it("produces identical output for identical input", () => {
    const items = [item("a", 137, 11), item("b", 291, 0), item("c", 44, 40)];
    const price = toCents(333.33);

    const first = allocatePackagePrices({ items, packagePriceCents: price });
    const second = allocatePackagePrices({ items, packagePriceCents: price });

    expectSoundAllocation(first, price);
    expect(second.allocations).toEqual(first.allocations);
  });

  it("holds the invariants across a spread of awkward prices", () => {
    const items = [item("a", 137, 11), item("b", 291, 0), item("c", 44, 40), item("d", 7, 3)];
    const minimum = allocatePackagePrices({ items, packagePriceCents: 1 }).minFeasibleCents;

    for (let price = minimum; price < minimum + 250; price += 7) {
      expectSoundAllocation(allocatePackagePrices({ items, packagePriceCents: price }), price);
    }
  });
});

describe("computeDiscount", () => {
  it("reports the saving and its percentage", () => {
    const res = computeDiscount({ basePriceTotalCents: toCents(300), packagePriceCents: toCents(240) });
    expect(res.discountCents).toBe(6000);
    expect(res.discountPercent).toBe(20);
  });

  it("reports zero when the bundle is not discounted", () => {
    const res = computeDiscount({ basePriceTotalCents: toCents(100), packagePriceCents: toCents(100) });
    expect(res.discountCents).toBe(0);
    expect(res.discountPercent).toBe(0);
  });

  it("never reports a negative discount when the bundle costs more", () => {
    const res = computeDiscount({ basePriceTotalCents: toCents(100), packagePriceCents: toCents(150) });
    expect(res.discountCents).toBe(0);
  });
});

describe("detectFloorDrift", () => {
  it("passes when every frozen price still clears its live floor", () => {
    const res = detectFloorDrift({
      items: [
        { subCollectionId: "1", itemName: "A", allocatedPriceUSD: 150, currentFloorUSD: 100 },
        { subCollectionId: "2", itemName: "B", allocatedPriceUSD: 100, currentFloorUSD: 100 },
      ],
    });
    expect(res.ok).toBe(true);
    expect(res.violations).toHaveLength(0);
  });

  it("flags an item whose floor rose above its frozen price", () => {
    // this is the CPI scenario: the package was priced last year, floors moved since
    const res = detectFloorDrift({
      items: [
        { subCollectionId: "1", itemName: "Plasma Rifle", allocatedPriceUSD: 100, currentFloorUSD: 105 },
      ],
    });

    expect(res.ok).toBe(false);
    expect(res.violations).toHaveLength(1);
    expect(res.violations[0].itemName).toBe("Plasma Rifle");
    expect(res.violations[0].shortfallUSD).toBe(5);
  });
});
