/**
 * Admin package routes — mounted at /api/v1/admin/packages
 *
 * GET    /                 — paginated list + status summary
 * GET    /:id              — one package, with each item's LIVE floor alongside the frozen price
 * POST   /preview-pricing  — per-item split for a proposed price, writes nothing
 * POST   /                 — create (multipart: image + fields)
 * PUT    /:id              — update
 * PUT    /:id/status       — draft | active | paused | archived
 * POST   /:id/revalidate   — re-check frozen prices against live buyback floors
 * DELETE /:id              — hard delete while draft, otherwise archive
 */
import express from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import uploadTemp from "../Middleware/UploadMulter.js";
import { saveImagePermanently } from "../Controllers/nftController.js";
import Package from "../Models/PackageModel.js";
import {
  previewPricing,
  createPackage,
  updatePackage,
  setPackageStatus,
  revalidatePackage,
  deletePackage,
  loadItemSnapshots,
  computeAvailableStock,
} from "../services/packageService.js";

const AdminPackageRouter = express.Router();

// Every route below is admin-only.
AdminPackageRouter.use(authMiddleware("admin"));

/** Multipart sends everything as strings; items arrives as a JSON string. */
function parseItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Turn a service-layer error into the right HTTP response. */
function sendServiceError(res, err, fallback = "Request failed") {
  const map = {
    NOT_FOUND: 404,
    ITEMS_NOT_ELIGIBLE: 409,
    PRICING_DRIFT: 409,
    ALREADY_SOLD: 409,
    NO_ITEMS: 400,
    BELOW_MIN: 400,
    INVALID_PRICE: 400,
    ITEM_WITHOUT_PRICE: 400,
  };
  const status = map[err?.code] || 500;
  if (status === 500) console.error("[AdminPackage]", err);

  return res.status(status).json({
    success: false,
    message: err?.message || fallback,
    code: err?.code || "ERROR",
    ...(err?.blocked ? { blocked: err.blocked } : {}),
    ...(err?.violations ? { violations: err.violations } : {}),
    ...(err?.minFeasiblePriceUSD !== undefined
      ? { minFeasiblePriceUSD: err.minFeasiblePriceUSD }
      : {}),
  });
}

// ── GET / ─────────────────────────────────────────────────────────────────────
AdminPackageRouter.get("/", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) filter.name = { $regex: String(search).trim(), $options: "i" };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const [rows, total, statusCounts] = await Promise.all([
      Package.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Package.countDocuments(filter),
      Package.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const summary = { draft: 0, active: 0, paused: 0, archived: 0, disabled_item_sold: 0, total: 0 };
    for (const row of statusCounts) {
      if (row._id in summary) summary[row._id] = row.count;
      summary.total += row.count;
    }

    return res.json({
      success: true,
      count: rows.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      summary,
      data: rows.map((p) => ({
        ...p,
        itemCount: p.items?.length || 0,
        availableStock: computeAvailableStock(p),
      })),
    });
  } catch (err) {
    return sendServiceError(res, err, "Failed to load packages");
  }
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
AdminPackageRouter.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid package id" });
    }

    const pkg = await Package.findById(req.params.id).lean();
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    // Pair each frozen price with the item's live floor so the UI can show drift.
    const { snapshots } = await loadItemSnapshots(
      pkg.items.map((i) => ({ parentId: i.parentId, subCollectionId: i.subCollectionId })),
    );
    const liveById = new Map(snapshots.map((s) => [s.subCollectionId, s]));

    return res.json({
      success: true,
      data: {
        ...pkg,
        availableStock: computeAvailableStock(pkg),
        items: pkg.items.map((i) => {
          const live = liveById.get(String(i.subCollectionId));
          return {
            ...i,
            currentFloorUSD: live ? live.floorUSD : null,
            currentBasePriceUSD: live ? live.basePriceUSD : null,
            stillExists: Boolean(live),
            drifted: live ? i.allocatedPriceUSD < live.floorUSD : true,
          };
        }),
      },
    });
  } catch (err) {
    return sendServiceError(res, err, "Failed to load package");
  }
});

// ── POST /preview-pricing ─────────────────────────────────────────────────────
AdminPackageRouter.post("/preview-pricing", async (req, res) => {
  try {
    const { items, priceUSD, excludePackageId } = req.body || {};
    const preview = await previewPricing({
      items: parseItems(items),
      priceUSD,
      excludePackageId: excludePackageId || null,
    });
    return res.json({ success: true, data: preview });
  } catch (err) {
    return sendServiceError(res, err, "Failed to price package");
  }
});

// ── POST / ────────────────────────────────────────────────────────────────────
AdminPackageRouter.post("/", uploadTemp.single("image"), async (req, res) => {
  try {
    const { name, description, badge, slug, priceUSD, status, startsAt, endsAt } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Package name is required" });
    }

    let image = "";
    if (req.file) image = await saveImagePermanently(req.file.path, req.file.filename);
    else if (req.body.image) image = req.body.image;

    const pkg = await createPackage(
      {
        name,
        description,
        badge,
        slug,
        image,
        priceUSD,
        status,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        items: parseItems(req.body.items),
      },
      req.user._id || req.user.id,
    );

    return res.status(201).json({
      success: true,
      message: `Package "${pkg.name}" created`,
      data: pkg,
    });
  } catch (err) {
    return sendServiceError(res, err, "Failed to create package");
  }
});

// ── PUT /:id ──────────────────────────────────────────────────────────────────
AdminPackageRouter.put("/:id", uploadTemp.single("image"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid package id" });
    }

    const payload = {};
    for (const field of ["name", "description", "badge", "slug", "startsAt", "endsAt"]) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    if (req.body.priceUSD !== undefined) payload.priceUSD = req.body.priceUSD;
    if (req.body.items !== undefined) payload.items = parseItems(req.body.items);

    if (req.file) payload.image = await saveImagePermanently(req.file.path, req.file.filename);
    else if (req.body.image) payload.image = req.body.image;

    const pkg = await updatePackage(req.params.id, payload);
    return res.json({ success: true, message: `Package "${pkg.name}" updated`, data: pkg });
  } catch (err) {
    return sendServiceError(res, err, "Failed to update package");
  }
});

// ── PUT /:id/status ───────────────────────────────────────────────────────────
AdminPackageRouter.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ["draft", "active", "paused", "archived"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const { pkg, unlisted } = await setPackageStatus(req.params.id, status);

    const message =
      unlisted.length > 0
        ? `Package is now active. ${unlisted.length} item${unlisted.length === 1 ? " was" : "s were"} removed from the marketplace and reserved for it.`
        : `Package is now ${status}`;

    return res.json({ success: true, message, data: pkg, unlisted });
  } catch (err) {
    return sendServiceError(res, err, "Failed to change package status");
  }
});

// ── POST /:id/revalidate ──────────────────────────────────────────────────────
AdminPackageRouter.post("/:id/revalidate", async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const result = await revalidatePackage(pkg);
    return res.json({
      success: true,
      message: result.ok
        ? "Pricing is still valid"
        : "Item buyback floors have risen above this package's prices",
      data: result,
    });
  } catch (err) {
    return sendServiceError(res, err, "Failed to revalidate package");
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
AdminPackageRouter.delete("/:id", async (req, res) => {
  try {
    const result = await deletePackage(req.params.id);
    return res.json({
      success: true,
      message: result.deleted ? "Package deleted" : "Package archived",
      data: result,
    });
  } catch (err) {
    return sendServiceError(res, err, "Failed to delete package");
  }
});

export default AdminPackageRouter;
