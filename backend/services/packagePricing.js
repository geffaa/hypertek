/**
 * Package pricing — pure allocation math. No DB, no express, no I/O.
 *
 * A package sells N existing items for one discounted price. Each item still has to
 * be handed to `finalizeNFAPurchase` with its own price, and that function hard-rejects
 * any price below the item's `minimumBuybackUSD` (BELOW_RESERVE). So the bundle discount
 * has to be split across the items in a way that never pushes one under its own floor.
 *
 * Everything here is integer cents. Float arithmetic drifts by fractions of a cent, and
 * at the floor boundary that is exactly what turns a valid package into a BELOW_RESERVE
 * throw halfway through fulfilment, after the buyer has already paid.
 */

/** Convert a USD amount to integer cents. Input is expected to be 2-decimal money. */
export function toCents(usd) {
  const n = Number(usd);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

/** Convert integer cents back to a USD number. */
export function fromCents(cents) {
  return Math.round(Number(cents)) / 100;
}

/**
 * Every item must end up with at least 1 cent — a $0.00 sale breaks the commission
 * split and leaves a meaningless row in salesHistory.
 */
function effectiveFloor(item) {
  return Math.max(Math.trunc(item.floorCents) || 0, 1);
}

/**
 * Split `packagePriceCents` across `items` proportionally to their individual prices,
 * without letting any item fall below its buyback floor.
 *
 * @param {Object}   input
 * @param {Array}    input.items              [{ id, basePriceCents, floorCents }]
 * @param {number}   input.packagePriceCents  what the buyer pays, in cents
 * @returns {{
 *   ok: boolean, reason?: string, message?: string,
 *   allocations: Array<{ id, basePriceCents, floorCents, allocatedCents }>,
 *   violations: Array<{ id, floorCents, basePriceCents }>,
 *   minFeasibleCents: number,
 * }}
 */
export function allocatePackagePrices({ items, packagePriceCents }) {
  const empty = { allocations: [], violations: [], minFeasibleCents: 0 };

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, reason: "NO_ITEMS", message: "A package needs at least one item.", ...empty };
  }

  const price = Math.trunc(Number(packagePriceCents));
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, reason: "INVALID_PRICE", message: "Package price must be greater than zero.", ...empty };
  }

  const norm = items.map((it) => ({
    id: String(it.id),
    basePriceCents: Math.trunc(Number(it.basePriceCents)) || 0,
    floorCents: Math.max(Math.trunc(Number(it.floorCents)) || 0, 0),
  }));

  // Proportional allocation is meaningless without a base price to be proportional to.
  const priceless = norm.filter((i) => i.basePriceCents <= 0);
  if (priceless.length > 0) {
    return {
      ok: false,
      reason: "ITEM_WITHOUT_PRICE",
      message: "Every item needs its own price before it can be bundled.",
      ...empty,
      violations: priceless.map((i) => ({ id: i.id, floorCents: i.floorCents, basePriceCents: i.basePriceCents })),
    };
  }

  // The floor of the whole package: what each item is individually guaranteed, summed.
  // Note this is Σ max(floor, 1), NOT max(Σ floor, n) — an item with a $0 floor still
  // needs its 1 cent, so the two formulas differ whenever floors are mixed.
  const minFeasibleCents = norm.reduce((sum, i) => sum + effectiveFloor(i), 0);

  if (price < minFeasibleCents) {
    return {
      ok: false,
      reason: "BELOW_MIN",
      message: `This package cannot be priced below $${fromCents(minFeasibleCents).toFixed(2)}.`,
      allocations: [],
      minFeasibleCents,
      violations: norm
        .filter((i) => i.floorCents > 0)
        .sort((a, b) => b.floorCents - a.floorCents)
        .map((i) => ({ id: i.id, floorCents: i.floorCents, basePriceCents: i.basePriceCents })),
    };
  }

  // ── Pass 1: water-filling ────────────────────────────────────────────────────
  // Repeatedly pin any item whose proportional share would land under its floor,
  // remove it from the pool, and re-spread the remaining budget over the rest.
  // Terminates in at most `norm.length` passes because each pass pins ≥ 1 item.
  const fixed = new Map();
  let free = norm.slice();
  let remaining = price;
  let baseTotal = free.reduce((s, i) => s + i.basePriceCents, 0);

  for (let pass = 0; pass <= norm.length; pass++) {
    if (free.length === 0) break;

    // share_i = basePrice_i * remaining / baseTotal. Compare against the floor without
    // dividing, so this stays exact integer arithmetic.
    const under = free.filter((i) => i.basePriceCents * remaining < effectiveFloor(i) * baseTotal);
    if (under.length === 0) break;

    for (const i of under) {
      const floorC = effectiveFloor(i);
      fixed.set(i.id, floorC);
      remaining -= floorC;
      baseTotal -= i.basePriceCents;
    }
    free = free.filter((i) => !fixed.has(i.id));
  }

  // ── Pass 2: settle the remaining budget, exact to the cent ───────────────────
  const allocated = new Map(fixed);

  if (free.length > 0) {
    // Largest-remainder method: floor everything, then hand the leftover pennies to
    // the largest fractional parts. Ties break on id so the result is deterministic.
    const parts = free.map((i) => {
      const numerator = i.basePriceCents * remaining;
      return {
        id: i.id,
        cents: Math.floor(numerator / baseTotal),
        remainder: numerator % baseTotal,
      };
    });

    const assigned = parts.reduce((s, p) => s + p.cents, 0);
    let leftover = remaining - assigned; // 0 <= leftover < free.length

    parts.sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));
    for (let k = 0; k < leftover; k++) parts[k].cents += 1;

    for (const p of parts) allocated.set(p.id, p.cents);
  } else if (remaining > 0) {
    // Every item was pinned to its floor and there is still budget left over.
    // Give the surplus to the most expensive item rather than dropping it.
    const biggest = norm
      .slice()
      .sort((a, b) => b.basePriceCents - a.basePriceCents || a.id.localeCompare(b.id))[0];
    allocated.set(biggest.id, allocated.get(biggest.id) + remaining);
  }

  const allocations = norm.map((i) => ({
    id: i.id,
    basePriceCents: i.basePriceCents,
    floorCents: i.floorCents,
    allocatedCents: allocated.get(i.id),
  }));

  // ── Invariants. If any of these trip it is a bug in this function, not bad input.
  const total = allocations.reduce((s, a) => s + a.allocatedCents, 0);
  if (total !== price) {
    throw new Error(`packagePricing: allocation total ${total} !== package price ${price}`);
  }
  for (const a of allocations) {
    if (a.allocatedCents < 1) {
      throw new Error(`packagePricing: item ${a.id} allocated ${a.allocatedCents} cents`);
    }
    if (a.allocatedCents < a.floorCents) {
      throw new Error(
        `packagePricing: item ${a.id} allocated ${a.allocatedCents} below floor ${a.floorCents}`,
      );
    }
  }

  return { ok: true, allocations, violations: [], minFeasibleCents };
}

/** Discount of a bundle against the summed individual prices. */
export function computeDiscount({ basePriceTotalCents, packagePriceCents }) {
  const base = Math.trunc(Number(basePriceTotalCents)) || 0;
  const price = Math.trunc(Number(packagePriceCents)) || 0;
  if (base <= 0) return { discountCents: 0, discountPercent: 0 };

  const discountCents = Math.max(0, base - price);
  const discountPercent = Math.round((discountCents / base) * 1000) / 10; // one decimal
  return { discountCents, discountPercent };
}

/**
 * Compare the prices frozen on a package against the items' live buyback floors.
 *
 * Floors move after a package is saved — CPI raises them annually, and a resale bumps
 * them. A package priced today can therefore become unfulfillable later, and we need to
 * catch that *before* taking the buyer's money rather than mid-fulfilment.
 *
 * @param {Array} items [{ subCollectionId, itemName, allocatedPriceUSD, currentFloorUSD }]
 */
export function detectFloorDrift({ items }) {
  const violations = [];

  for (const it of items || []) {
    const allocatedCents = toCents(it.allocatedPriceUSD);
    const floorCents = toCents(it.currentFloorUSD);
    if (!Number.isFinite(allocatedCents) || !Number.isFinite(floorCents)) continue;

    if (floorCents > 0 && allocatedCents < floorCents) {
      violations.push({
        subCollectionId: String(it.subCollectionId ?? ""),
        itemName: it.itemName ?? "",
        allocatedPriceUSD: fromCents(allocatedCents),
        currentFloorUSD: fromCents(floorCents),
        shortfallUSD: fromCents(floorCents - allocatedCents),
      });
    }
  }

  return { ok: violations.length === 0, violations };
}
