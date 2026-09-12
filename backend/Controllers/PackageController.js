import Package from "../Models/PackageModel.js";
import { computeAvailableStock } from "../services/packageService.js";

/** Public: browse active packages only — no admin fields, no pricingViolations. */
export async function ListActivePackages(req, res) {
  try {
    const packages = await Package.find({ status: "active" }).sort({ createdAt: -1 });
    const shaped = packages.map((pkg) => ({
      _id: pkg._id,
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      image: pkg.image,
      badge: pkg.badge,
      type: pkg.type,
      priceUSD: pkg.priceUSD,
      basePriceTotalUSD: pkg.basePriceTotalUSD,
      discountPercent: pkg.discountPercent,
      currency: pkg.currency,
      items: pkg.items,
      mintReward: pkg.mintReward,
      resourceRewards: pkg.resourceRewards,
      availableStock: computeAvailableStock(pkg),
    }));
    res.json({ success: true, packages: shaped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function GetActivePackage(req, res) {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.idOrSlug)
      ? { _id: req.params.idOrSlug }
      : { slug: req.params.idOrSlug };
    const pkg = await Package.findOne({ ...query, status: "active" });
    if (!pkg) return res.status(404).json({ success: false, error: "Package not found" });
    res.json({
      success: true,
      package: {
        _id: pkg._id,
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        image: pkg.image,
        badge: pkg.badge,
        type: pkg.type,
        priceUSD: pkg.priceUSD,
        basePriceTotalUSD: pkg.basePriceTotalUSD,
        discountPercent: pkg.discountPercent,
        currency: pkg.currency,
        items: pkg.items,
        mintReward: pkg.mintReward,
        resourceRewards: pkg.resourceRewards,
        availableStock: computeAvailableStock(pkg),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
