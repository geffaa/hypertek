import NFTSystem from "../Models/NFTSystem.js";
import MarketListing from "../Models/MarketListingModel.js";
import { Offer } from "../Models/Offer.js";

// ── category normalisation (same table the marketplace controllers use) ──────
const CAT_ALIAS = {
  "military badges and collectables": "military badges",
  "vehicles": "racing vehicles",
  "land/bases": "land and bases",
};

const CATEGORIES = [
  "skins",
  "military badges",
  "specialists",
  "weapons",
  "body armour",
  "spaceships",
  "racing vehicles",
  "artwork",
  "land and bases",
  "general",
];

const CATEGORY_LABEL = {
  "skins": "Skins",
  "military badges": "Military Badges",
  "specialists": "Specialists",
  "weapons": "Weapons",
  "body armour": "Body Armour",
  "spaceships": "Spaceships",
  "racing vehicles": "Racing Vehicles",
  "artwork": "Artwork",
  "land and bases": "Land and Bases",
  "general": "General",
};

function normalizeCat(cat) {
  const raw = (cat || "general").toLowerCase().trim();
  return CAT_ALIAS[raw] || (CATEGORIES.includes(raw) ? raw : "general");
}

// ── owner side ──────────────────────────────────────────────────────────────
// Mirrors Service/nftPurchaseService.js — an empty owner, the literal strings
// "admin"/"platform", or the platform wallet all mean Hypertek still holds it.
function isAdminOwner(owner) {
  const o = String(owner || "").toLowerCase().trim();
  const platform = String(process.env.PLATFORM_WALLET_ADDRESS || "").toLowerCase().trim();
  return !o || o === "admin" || o === "platform" || (!!platform && o === platform);
}

// ── section keys ────────────────────────────────────────────────────────────
// Don asked for five: Admin NFA/NFC/NFT plus Players NFC/NFT. Player-held NFA
// is a data anomaly (NFA is Hypertek-only) so it is tracked but only returned
// when something actually lands in it.
const SECTIONS = [
  { key: "admin-NFA",  side: "admin",  assetType: "NFA", label: "Admin's NFA" },
  { key: "admin-NFC",  side: "admin",  assetType: "NFC", label: "Admin's NFC" },
  { key: "admin-NFT",  side: "admin",  assetType: "NFT", label: "Admin's NFT" },
  { key: "player-NFC", side: "player", assetType: "NFC", label: "Players NFC" },
  { key: "player-NFT", side: "player", assetType: "NFT", label: "Players NFT" },
  { key: "player-NFA", side: "player", assetType: "NFA", label: "Players NFA", optional: true },
];

const MONTHS_BACK = 12;
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthWindow() {
  const now = new Date();
  const out = [];
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: monthKey(d),
      label: `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    });
  }
  return out;
}

function emptyCategoryRow(category) {
  return {
    category,
    label: CATEGORY_LABEL[category] || category,
    items: 0,        // items that exist in this section
    listed: 0,       // currently listed for sale
    listedValue: 0,  // sum of asking prices of listed items
    sold: 0,         // completed sales
    salesValue: 0,   // value of those sales
    offers: 0,       // offers made against items in this category
    offerValue: 0,
  };
}

function emptySection(def, monthWindow) {
  return {
    key: def.key,
    label: def.label,
    side: def.side,
    assetType: def.assetType,
    optional: !!def.optional,
    totals: { items: 0, listed: 0, listedValue: 0, sold: 0, salesValue: 0, offers: 0, offerValue: 0 },
    categories: Object.fromEntries(CATEGORIES.map((c) => [c, emptyCategoryRow(c)])),
    monthly: Object.fromEntries(monthWindow.map((m) => [m.month, { ...m, sold: 0, salesValue: 0 }])),
  };
}

function rankBestWorst(rows, valueKey) {
  if (rows.length === 0) return { best: null, worst: null };
  const sorted = [...rows].sort((a, b) => b[valueKey] - a[valueKey]);
  return {
    best: sorted[0],
    worst: sorted.length > 1 ? sorted[sorted.length - 1] : null,
  };
}

// Months before the section's first ever sale are pre-launch noise, not a bad
// month. From the first sale onward a zero-sales month is genuinely the worst.
function rankMonths(monthly) {
  const firstActive = monthly.findIndex((m) => m.sold > 0);
  if (firstActive === -1) return { best: null, worst: null };
  return rankBestWorst(monthly.slice(firstActive), "salesValue");
}

// A category holding stock but selling nothing is a worse performer than one
// that sold something, so rank everything present rather than sales-only. With
// no sales anywhere in the section, fall back to ranking by what is on the shelf.
function rankCategories(categories) {
  const present = categories.filter((c) => c.items > 0 || c.sold > 0 || c.offers > 0);
  const basis = present.some((c) => c.sold > 0) ? "sales" : "listed";
  const ranked = rankBestWorst(present, basis === "sales" ? "salesValue" : "listedValue");
  return { ...ranked, basis };
}

/**
 * GET /api/dashboard/asset-breakdown
 *
 * Listed totals, sales and offers split by owner side (Admin / Players) and
 * asset type (NFA / NFC / NFT), then broken down per category, per month, with
 * best and worst performers for each section.
 */
export const getAssetBreakdown = async (req, res) => {
  try {
    const monthWindow = buildMonthWindow();
    const monthKeys = new Set(monthWindow.map((m) => m.month));

    const sections = {};
    for (const def of SECTIONS) sections[def.key] = emptySection(def, monthWindow);

    const sectionKey = (side, assetType) => {
      const type = ["NFA", "NFC", "NFT"].includes(assetType) ? assetType : "NFT";
      const key = `${side}-${type}`;
      return sections[key] ? key : null;
    };

    const bump = (key, category, field, amount = 1) => {
      if (!key) return;
      const s = sections[key];
      s.totals[field] += amount;
      s.categories[category][field] += amount;
    };

    const bumpMonth = (key, date, soldDelta, valueDelta) => {
      if (!key) return;
      const mk = monthKey(date);
      if (!monthKeys.has(mk)) return; // outside the 12-month window
      const m = sections[key].monthly[mk];
      m.sold += soldDelta;
      m.salesValue += valueDelta;
    };

    // ── 1. NFTSystem: items, listings and sales history ─────────────────────
    const docs = await NFTSystem.find({})
      .select("collection category isParentCollection subCollections assetType owner listed priceETH salesHistory createdAt")
      .lean();

    // subCollection _id → { key, category } so offers can be routed later
    const itemIndex = new Map();

    const ingestItem = (item, category) => {
      const side = isAdminOwner(item.owner) ? "admin" : "player";
      const key = sectionKey(side, item.assetType);
      if (!key) return;

      itemIndex.set(String(item._id), { key, category });

      bump(key, category, "items", 1);
      if (item.listed) {
        bump(key, category, "listed", 1);
        bump(key, category, "listedValue", Number(item.priceETH) || 0);
      }

      // A sale belongs to whoever sold it, which is not always the current owner.
      for (const sale of item.salesHistory || []) {
        const saleSide = isAdminOwner(sale.seller) ? "admin" : "player";
        const saleKey = sectionKey(saleSide, item.assetType);
        const value = Number(sale.priceETH) || 0;
        bump(saleKey, category, "sold", 1);
        bump(saleKey, category, "salesValue", value);
        bumpMonth(saleKey, sale.createdAt || item.createdAt, 1, value);
      }
    };

    for (const doc of docs) {
      const category = normalizeCat(doc.category || doc.collection?.name);
      const subs = doc.subCollections || [];
      if (subs.length) {
        for (const sub of subs) ingestItem(sub, category);
      } else if (!doc.isParentCollection) {
        // Legacy single NFTs live on the parent document itself.
        ingestItem(doc, category);
      }
    }

    // ── 2. MarketListing: player listings with no NFTSystem item behind them ─
    // Linked listings already flipped subCollections[].listed, so counting them
    // again here would double the player totals.
    const listings = await MarketListing.find({})
      .select("category assetType status price currentOffer nftSystemId subCollectionId offerHistory bidHistory createdAt")
      .lean();

    for (const listing of listings) {
      const category = normalizeCat(listing.category);
      const key = sectionKey("player", listing.assetType);
      if (!key) continue;

      const linked = !!(listing.nftSystemId && listing.subCollectionId);
      if (!linked && listing.status === "active") {
        bump(key, category, "items", 1);
        bump(key, category, "listed", 1);
        bump(key, category, "listedValue", Number(listing.price) || 0);
      }

      // Offers and bids on a player listing are player-side offers either way.
      for (const offer of listing.offerHistory || []) {
        bump(key, category, "offers", 1);
        bump(key, category, "offerValue", Number(offer.amount) || 0);
      }
      for (const bid of listing.bidHistory || []) {
        bump(key, category, "offers", 1);
        bump(key, category, "offerValue", Number(bid.amount) || 0);
      }
    }

    // ── 3. Offer collection: "Make Offer" on a marketplace item ─────────────
    const offers = await Offer.find({})
      .select("gameId offerPrice ownerId createdAt")
      .lean();

    let unmatchedOffers = 0;
    for (const offer of offers) {
      const hit = itemIndex.get(String(offer.gameId));
      if (!hit) { unmatchedOffers++; continue; }
      bump(hit.key, hit.category, "offers", 1);
      bump(hit.key, hit.category, "offerValue", Number(offer.offerPrice) || 0);
    }

    // ── 4. Shape the response: arrays, best/worst, drop empty optionals ─────
    const payload = SECTIONS.map((def) => {
      const s = sections[def.key];
      const categories = CATEGORIES.map((c) => s.categories[c]);
      const monthly = monthWindow.map((m) => s.monthly[m.month]);

      const byMonth = rankMonths(monthly);
      const byCategory = rankCategories(categories);

      return {
        key: s.key,
        label: s.label,
        side: s.side,
        assetType: s.assetType,
        optional: s.optional,
        totals: s.totals,
        categories,
        monthly,
        best: {
          month: byMonth.best,
          category: byCategory.best,
          categoryBasis: byCategory.basis,
        },
        worst: {
          month: byMonth.worst,
          category: byCategory.worst,
          categoryBasis: byCategory.basis,
        },
      };
    }).filter((s) => !s.optional || s.totals.items > 0 || s.totals.sold > 0 || s.totals.offers > 0);

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      months: monthWindow,
      unmatchedOffers,
      sections: payload,
    });
  } catch (error) {
    console.error("getAssetBreakdown error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getAssetBreakdown;
