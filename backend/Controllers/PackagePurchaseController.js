import PackagePurchase from "../Models/PackagePurchaseModel.js";
import { createPackagePurchaseIntent, confirmPackageUsdcPayment } from "../services/packagePurchaseService.js";

export async function CreatePackagePurchase(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const buyerWallet = req.body?.buyerWallet || req.user?.WalletAddress || req.user?.MetaMaskAddress;
    if (!buyerWallet) {
      return res.status(400).json({ success: false, error: "No wallet address on file for this account" });
    }

    const purchase = await createPackagePurchaseIntent({
      packageId: req.body?.packageId,
      userId,
      buyerWallet,
    });

    res.json({ success: true, purchase });
  } catch (error) {
    console.error("CreatePackagePurchase error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function ConfirmPackageUsdcPurchase(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { txHash } = req.body || {};
    if (!txHash) return res.status(400).json({ success: false, error: "txHash is required" });

    const purchase = await PackagePurchase.findOne({ _id: req.params.id, userId });
    if (!purchase) return res.status(404).json({ success: false, error: "Purchase not found" });

    const result = await confirmPackageUsdcPayment({ purchaseId: purchase._id, txHash });
    res.json({ success: true, purchase: result });
  } catch (error) {
    console.error("ConfirmPackageUsdcPurchase error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function GetPackagePurchase(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const purchase = await PackagePurchase.findOne({ _id: req.params.id, userId });
    if (!purchase) return res.status(404).json({ success: false, error: "Purchase not found" });
    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
