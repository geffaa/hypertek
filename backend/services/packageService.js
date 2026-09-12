/**
 * Package business logic. Route handlers stay thin and call into here.
 *
 * Phase 2 scope: eligibility, pricing validation and CRUD. The purchase and
 * fulfilment half lands in phase 5 and will live in this same module.
 */

import mongoose from "mongoose";
import Package from "../Models/PackageModel.js";
import NFTSystem from "../Models/NFTSystem.js";
import MarketListing from "../Models/MarketListingModel.js";
import Auction from "../Models/AuctionModel.js";
import { syncSubCollectionPrice } from "../Controllers/MarketListingController.js";
import {
  allocatePackagePrices,
  computeDiscount,
  detectFloorDrift,
  toCents,
  fromCents,
} from "./packagePricing.js";

// Statuses in which a package still holds a claim on its items.
export const LIVE_PACKAGE_STATUSES = ["draft", "active", "paused"];

// A listing/auction in one of these is still competing for the same item.
const OPEN_LISTING_STATUSES = ["active", "pending"];
const OPEN_AUCTION_STATUSES = ["active", "buyback_pending"];

const PLATFORM_OWNER_ALIASES = new Set(["", "admin", "hypertek", "hyper tek"]);

/**
 * Does the platform still hold this item?
 *
 * Mirrors the check in Service/nftPurchaseService.js (empty owner / "admin" /
 * the configured platform wallet), plus one env-independent signal: an item that
 * admin created and that has never sold is platform-held no matter which wallet
 * string happens to be stamped on it.
 *
 * That extra signal matters because the wallet address used to stamp new items
 * (VITE_PLATFORM_WALLET_ADDRESS, in the admin build) and the one the backend
 * compares against (PLATFORM_WALLET_ADDRESS) are configured separately and have
 * drifted apart before.
 */
function isPlatformOwned(snap) {
  const owner = String(snap?.owner ?? "").trim().toLowerCase();
  if (PLATFORM_OWNER_ALIASES.has(owner)) return true;

  const platformWallet = String(process.env.PLATFORM_WALLET_ADDRESS ?? "").trim().toLowerCase();
  if (platformWallet && owner === platformWallet) return true;

  return snap?.createdByAdmin === true && snap?.isFirstSale === true;
}

/**
 * Load the live subdocument for each (parentId, subCollectionId) pair.
 * Batched by parent so a 6-item package is 1 query, not 6.
 */
export async function loadItemSnapshots(itemRefs = []) {
  const snapshots = [];
  const missing = [];

  const parentIds = [
    ...new Set(
      itemRefs
        .map((r) => String(r.parentId ?? ""))
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    ),
  ];

  const parents = parentIds.length
    ? await NFTSystem.find({ _id: { $in: parentIds } })
    : [];
  const parentById = new Map(parents.map((p) => [String(p._id), p]));

  for (const ref of itemRefs) {
    const parent = parentById.get(String(ref.parentId));
    const sub = parent?.subCollections?.id(String(ref.subCollectionId));

    if (!parent || !sub) {
      missing.push({
        parentId: String(ref.parentId ?? ""),
        subCollectionId: String(ref.subCollectionId ?? ""),
      });
      continue;
    }

    snapshots.push({
      parentId: parent._id,
      subCollectionId: String(sub._id),
      name: sub.name || "",
      image: sub.image || "",
      assetType: sub.assetType || "NFT",
      category: parent.category || "",
      basePriceUSD: Number(sub.priceETH) || 0,
      floorUSD: Number(sub.minimumBuybackUSD) || 0,
      maxSupply: Number(sub.maxSupply) || 1,
      currentSupply: Number(sub.currentSupply) || 0,
      listed: Boolean(sub.listed),
      isFirstSale: sub.isFirstSale !== false,
      owner: sub.owner || "",
      createdByAdmin: parent.collection?.creator === "admin",
      _sub: sub,
    });
  }

  return { snapshots, missing };
}

/**
 * Can these items be bundled? Blocks anything already spoken for elsewhere, so the
 * same item can never be sold twice.
 *
 * Returns every blocked item with a human-readable reason, so the admin UI can show
 * the problem inline instead of a single opaque failure.
 */
export async function assertItemsEligible(
  itemRefs = [],
  { excludePackageId = null, enforceExclusive = false } = {},
) {
  const blocked = [];
  const warnings = [];
  const { snapshots, missing } = await loadItemSnapshots(itemRefs);

  for (const m of missing) {
    blocked.push({ ...m, itemName: "", reason: "Item no longer exists." });
  }
  if (snapshots.length === 0) return { ok: blocked.length === 0, blocked, warnings, snapshots };

  const subIds = snapshots.map((s) => s.subCollectionId);

  // Everything that could also be claiming these items, fetched in three queries
  // rather than three per item.
  const packageQuery = {
    "items.subCollectionId": { $in: subIds },
    status: { $in: LIVE_PACKAGE_STATUSES },
  };
  if (excludePackageId && mongoose.Types.ObjectId.isValid(String(excludePackageId))) {
    packageQuery._id = { $ne: new mongoose.Types.ObjectId(String(excludePackageId)) };
  }

  const [otherPackages, listings, auctions] = await Promise.all([
    Package.find(packageQuery).select("name items.subCollectionId").lean(),
    MarketListing.find({
      subCollectionId: { $in: subIds },
      status: { $in: OPEN_LISTING_STATUSES },
    })
      .select("subCollectionId")
      .lean(),
    Auction.find({
      subCollectionId: { $in: subIds },
      status: { $in: OPEN_AUCTION_STATUSES },
    })
      .select("subCollectionId")
      .lean(),
  ]);

  const packageBySub = new Map();
  for (const pkg of otherPackages) {
    for (const it of pkg.items || []) {
      if (subIds.includes(String(it.subCollectionId))) {
        packageBySub.set(String(it.subCollectionId), pkg.name);
      }
    }
  }
  const listedSubs = new Set(listings.map((l) => String(l.subCollectionId)));
  const auctionedSubs = new Set(auctions.map((a) => String(a.subCollectionId)));

  for (const snap of snapshots) {
    const id = snap.subCollectionId;
    const base = { parentId: String(snap.parentId), subCollectionId: id, itemName: snap.name };

    if (packageBySub.has(id)) {
      blocked.push({ ...base, reason: `Already in package "${packageBySub.get(id)}".` });
      continue;
    }
    if (auctionedSubs.has(id)) {
      blocked.push({ ...base, reason: "Currently in an auction." });
      continue;
    }
    // Being listed individually is not a blocker while the package is a draft —
    // a draft isn't selling anything, so nothing can be bought twice yet.
    // Activation is where exclusivity is enforced: the item is pulled off the
    // marketplace so the package becomes its only route to a buyer.
    if (snap.listed || listedSubs.has(id)) {
      if (enforceExclusive) {
        warnings.push({ ...base, reason: "Will be removed from the marketplace." });
      } else {
        warnings.push({ ...base, reason: "Listed individually. It will be unlisted when this package goes live." });
      }
    }
    if (!isPlatformOwned(snap)) {
      blocked.push({ ...base, reason: "Owned by a user, so it cannot be bundled." });
      continue;
    }
    // Unique items are one-shot; an already-sold one has nothing left to give.
    // Editions are fine — they keep their own supply counter.
    if (snap.maxSupply <= 1 && !snap.isFirstSale) {
      blocked.push({ ...base, reason: "Already sold." });
      continue;
    }
    if (snap.maxSupply > 1 && snap.currentSupply >= snap.maxSupply) {
      blocked.push({ ...base, reason: "Sold out." });
      continue;
    }
    if (snap.basePriceUSD <= 0) {
      blocked.push({ ...base, reason: "Has no price yet. Set a price on the item first." });
      continue;
    }
  }

  return { ok: blocked.length === 0, blocked, warnings, snapshots };
}

/**
 * Take the member items off the marketplace so the package is their only route
 * to a buyer. Called when a package goes live.
 *
 * Mirrors the admin unlist endpoint: cancel any open MarketListing, then sync the
 * embedded subdocument's `listed`/`priceETH`, which is what the public grid reads.
 */
async function unlistPackageItems(pkg) {
  const unlisted = [];

  for (const item of pkg.items) {
    const subId = String(item.subCollectionId);

    await MarketListing.updateMany(
      { subCollectionId: subId, status: { $in: OPEN_LISTING_STATUSES } },
      {
        status: "cancelled",
        cancelledByAdmin: true,
        adminCancelReason: `Reserved for package "${pkg.name}"`,
      },
    );

    try {
      await syncSubCollectionPrice(item.parentId, subId, 0, false);
      unlisted.push(item.name || subId);
    } catch (err) {
      // Don't fail activation over a sync hiccup on one item — the listing is
      // already cancelled, and revalidate/repair endpoints can reconcile the flag.
      console.error(`[package activate] failed to unlist ${subId}:`, err.message);
    }
  }

  return unlisted;
}

/**
 * Work out the per-item split for a proposed bundle price, without writing anything.
 * Backs the live pricing panel in the admin form.
 */
export async function previewPricing({ items: itemRefs = [], priceUSD, excludePackageId = null }) {
  const { ok: eligible, blocked, warnings, snapshots } = await assertItemsEligible(itemRefs, {
    excludePackageId,
  });

  const basePriceTotalCents = snapshots.reduce((s, i) => s + toCents(i.basePriceUSD), 0);
  const priceCents = toCents(priceUSD);

  const allocation = allocatePackagePrices({
    items: snapshots.map((s) => ({
      id: s.subCollectionId,
      basePriceCents: toCents(s.basePriceUSD),
      floorCents: toCents(s.floorUSD),
    })),
    packagePriceCents: priceCents,
  });

  const allocatedById = new Map(
    (allocation.allocations || []).map((a) => [a.id, a.allocatedCents]),
  );

  const { discountCents, discountPercent } = computeDiscount({
    basePriceTotalCents,
    packagePriceCents: priceCents,
  });

  return {
    ok: eligible && allocation.ok,
    eligible,
    blocked,
    warnings,
    pricingOk: allocation.ok,
    reason: allocation.reason || null,
    message: allocation.message || null,
    basePriceTotalUSD: fromCents(basePriceTotalCents),
    priceUSD: fromCents(priceCents),
    discountUSD: fromCents(discountCents),
    discountPercent,
    minFeasiblePriceUSD: fromCents(allocation.minFeasibleCents),
    floorTotalUSD: fromCents(snapshots.reduce((s, i) => s + toCents(i.floorUSD), 0)),
    allocations: snapshots.map((s) => ({
      parentId: String(s.parentId),
      subCollectionId: s.subCollectionId,
      name: s.name,
      image: s.image,
      assetType: s.assetType,
      maxSupply: s.maxSupply,
      basePriceUSD: s.basePriceUSD,
      floorUSD: s.floorUSD,
      allocatedPriceUSD: fromCents(allocatedById.get(s.subCollectionId) ?? 0),
    })),
  };
}

/** Shared by create and update: validate, then build the persistable shape. */
async function buildPackagePayload({ items: itemRefs, priceUSD, excludePackageId = null }) {
  const preview = await previewPricing({ items: itemRefs, priceUSD, excludePackageId });

  if (!preview.eligible) {
    const err = new Error("Some items cannot be bundled.");
    err.code = "ITEMS_NOT_ELIGIBLE";
    err.blocked = preview.blocked;
    throw err;
  }
  if (!preview.pricingOk) {
    const err = new Error(preview.message || "Invalid package price.");
    err.code = preview.reason || "INVALID_PRICING";
    err.minFeasiblePriceUSD = preview.minFeasiblePriceUSD;
    throw err;
  }

  return {
    items: preview.allocations.map((a) => ({
      parentId: a.parentId,
      subCollectionId: a.subCollectionId,
      name: a.name,
      image: a.image,
      assetType: a.assetType,
      category: "",
      basePriceUSD: a.basePriceUSD,
      floorUSD: a.floorUSD,
      maxSupply: a.maxSupply,
      allocatedPriceUSD: a.allocatedPriceUSD,
    })),
    basePriceTotalUSD: preview.basePriceTotalUSD,
    priceUSD: preview.priceUSD,
    discountPercent: preview.discountPercent,
    floorTotalUSD: preview.floorTotalUSD,
    pricingValid: true,
    pricingViolations: [],
    lastValidatedAt: new Date(),
  };
}

export async function createPackage(payload, adminUserId = null) {
  const priced = await buildPackagePayload({
    items: payload.items,
    priceUSD: payload.priceUSD,
  });

  return Package.create({
    name: String(payload.name || "").trim(),
    slug: payload.slug ? String(payload.slug).trim().toLowerCase() : null,
    description: payload.description || "",
    image: payload.image || "",
    badge: payload.badge || "",
    status: payload.status === "active" ? "active" : "draft",
    startsAt: payload.startsAt || null,
    endsAt: payload.endsAt || null,
    createdBy: adminUserId || null,
    ...priced,
  });
}

export async function updatePackage(packageId, payload) {
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    const err = new Error("Package not found.");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (pkg.soldCount > 0) {
    const err = new Error("This package has already sold and can no longer be edited.");
    err.code = "ALREADY_SOLD";
    throw err;
  }

  const wantsRepricing = payload.items !== undefined || payload.priceUSD !== undefined;

  if (wantsRepricing) {
    const priced = await buildPackagePayload({
      items: payload.items ?? pkg.items.map((i) => ({
        parentId: i.parentId,
        subCollectionId: i.subCollectionId,
      })),
      priceUSD: payload.priceUSD ?? pkg.priceUSD,
      excludePackageId: pkg._id,
    });
    Object.assign(pkg, priced);
  }

  for (const field of ["name", "description", "image", "badge", "startsAt", "endsAt"]) {
    if (payload[field] !== undefined) pkg[field] = payload[field];
  }
  if (payload.slug !== undefined) {
    pkg.slug = payload.slug ? String(payload.slug).trim().toLowerCase() : null;
  }

  await pkg.save();
  return pkg;
}

/**
 * Re-check a package's frozen prices against the items' current buyback floors.
 * Floors rise over time (CPI, resales), so a package that was valid when saved can
 * quietly become unfulfillable. Auto-pauses rather than letting it sell.
 */
export async function revalidatePackage(pkg) {
  const { snapshots, missing } = await loadItemSnapshots(
    pkg.items.map((i) => ({ parentId: i.parentId, subCollectionId: i.subCollectionId })),
  );

  const liveFloorById = new Map(snapshots.map((s) => [s.subCollectionId, s.floorUSD]));

  const { ok, violations } = detectFloorDrift({
    items: pkg.items.map((i) => ({
      subCollectionId: i.subCollectionId,
      itemName: i.name,
      allocatedPriceUSD: i.allocatedPriceUSD,
      currentFloorUSD: liveFloorById.get(String(i.subCollectionId)) ?? i.floorUSD,
    })),
  });

  const allViolations = [...violations];
  for (const m of missing) {
    allViolations.push({
      subCollectionId: m.subCollectionId,
      itemName: "",
      allocatedPriceUSD: 0,
      currentFloorUSD: 0,
      shortfallUSD: 0,
      detectedAt: new Date(),
    });
  }

  const valid = ok && missing.length === 0;

  pkg.pricingValid = valid;
  pkg.pricingViolations = allViolations;
  pkg.lastValidatedAt = new Date();
  if (!valid && pkg.status === "active") pkg.status = "paused";
  await pkg.save();

  return { ok: valid, violations: allViolations, status: pkg.status };
}

/**
 * Sweep every live package. Called after a CPI adjustment, which raises floors
 * across the board and is the most likely way packages silently go stale.
 */
export async function revalidateAllActivePackages() {
  const packages = await Package.find({ status: { $in: ["active", "paused"] } });

  let checked = 0;
  let paused = 0;
  for (const pkg of packages) {
    const wasActive = pkg.status === "active";
    const res = await revalidatePackage(pkg);
    checked += 1;
    if (wasActive && !res.ok) paused += 1;
  }

  return { checked, paused };
}

export async function setPackageStatus(packageId, status) {
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    const err = new Error("Package not found.");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Going live re-runs every guard against live data — items may have been
  // listed or sold since the package was drafted.
  if (status === "active") {
    if (pkg.items.length === 0) {
      const err = new Error("Cannot activate an empty package.");
      err.code = "NO_ITEMS";
      throw err;
    }

    const { ok, blocked } = await assertItemsEligible(
      pkg.items.map((i) => ({ parentId: i.parentId, subCollectionId: i.subCollectionId })),
      { excludePackageId: pkg._id, enforceExclusive: true },
    );
    if (!ok) {
      const err = new Error("Some items are no longer available.");
      err.code = "ITEMS_NOT_ELIGIBLE";
      err.blocked = blocked;
      throw err;
    }

    const check = await revalidatePackage(pkg);
    if (!check.ok) {
      const err = new Error("Item buyback floors have risen above this package's prices.");
      err.code = "PRICING_DRIFT";
      err.violations = check.violations;
      throw err;
    }

    // Exclusivity: from here the package is the only way to buy these items.
    const unlisted = await unlistPackageItems(pkg);

    pkg.status = status;
    await pkg.save();
    return { pkg, unlisted };
  }

  pkg.status = status;
  await pkg.save();
  return { pkg, unlisted: [] };
}

export async function deletePackage(packageId) {
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    const err = new Error("Package not found.");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Anything that has ever sold is kept for history.
  if (pkg.status === "draft" && pkg.soldCount === 0) {
    await Package.deleteOne({ _id: pkg._id });
    return { deleted: true };
  }

  pkg.status = "archived";
  await pkg.save();
  return { deleted: false, archived: true };
}

/** Remaining stock = the least available of its member items. */
export function computeAvailableStock(pkg) {
  if (!pkg?.items?.length) return 0;
  const perItem = pkg.items.map((i) => {
    const max = Number(i.maxSupply) || 1;
    return max > 1 ? max : 1;
  });
  return Math.max(0, Math.min(...perItem) - (pkg.soldCount || 0) - (pkg.reservedCount || 0));
}
