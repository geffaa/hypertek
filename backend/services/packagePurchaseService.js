/**
 * Package purchase — create the intent, then fulfil it once payment lands.
 *
 * Two package types, two delivery paths:
 *   - bundle: N pre-existing items, one finalizeNFAPurchase call per item.
 *   - reward: HB (via the existing HBLedger), other resources recorded for
 *     later (no live inventory system exists for them yet — see PackageModel.js),
 *     and an optional freshly-minted item funded via computeRewardPackSplit.
 *
 * Sequential by design (matches the existing model's own doc comment): the
 * mint call below manages its own nonce, so two deliveries running at once
 * would collide. `lockedAt` on the purchase row is the mutex.
 */

import Package from "../Models/PackageModel.js";
import PackagePurchase from "../Models/PackagePurchaseModel.js";
import NFTSystem from "../Models/NFTSystem.js";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import { finalizeNFAPurchase } from "../Service/nftPurchaseService.js";
import { getBlockchain, ethers } from "../Service/blockchain.js";
import { computeRewardPackSplit } from "./gmbb/computeSaleSplit.js";
import { dispatchRoyalty } from "./RoyaltyService.js";

const ACTIVE_CHAIN_ID = Number(process.env.BASE_CHAIN_ID) || 84532;
const LOCK_TTL_MS = 5 * 60 * 1000;
const RESERVATION_TTL_MS = 15 * 60 * 1000;

/**
 * Verify a buyer's on-chain USDC transfer, exactly the same way
 * HBController.topupViaUSDC verifies a top-up: read the transaction receipt,
 * find the USDC contract's own Transfer log, confirm it actually paid the
 * platform wallet the claimed amount. Never trust the client's txHash/amount
 * pairing without checking the chain — a client could submit any hash.
 */
export async function verifyPackageUsdcPayment({ txHash, expectedUsdAmount }) {
  const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const usdcAddr = process.env.BASE_USDC_ADDRESS;
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
  if (!usdcAddr || !platformWallet) {
    throw new Error("Platform wallet not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction not found or failed on-chain");
  }

  const usdcInterface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  let verifiedAmount = 0;
  let fromAddress = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== usdcAddr.toLowerCase()) continue;
    try {
      const parsed = usdcInterface.parseLog(log);
      if (parsed.name === "Transfer" && parsed.args.to.toLowerCase() === platformWallet.toLowerCase()) {
        verifiedAmount = parseFloat(ethers.formatUnits(parsed.args.value, 6));
        fromAddress = parsed.args.from;
        break;
      }
    } catch { /* not this contract's log */ }
  }

  if (verifiedAmount <= 0) {
    throw new Error("No USDC transfer to the platform wallet found in this transaction");
  }
  if (Math.abs(verifiedAmount - expectedUsdAmount) > 0.01) {
    throw new Error(`Amount mismatch. On-chain: $${verifiedAmount} USDC, expected: $${expectedUsdAmount} USDC`);
  }

  return { verifiedAmount, fromAddress };
}

/**
 * Buyer has sent USDC and submitted the tx hash. Verify it on-chain, mark the
 * purchase paid, and run fulfillment — mirrors the Stripe webhook's
 * succeeded-payment handling, just triggered by the buyer's own confirm call
 * instead of a webhook.
 */
export async function confirmPackageUsdcPayment({ purchaseId, txHash }) {
  const purchase = await PackagePurchase.findById(purchaseId);
  if (!purchase) throw new Error("Purchase not found");
  if (purchase.status !== "pending_payment") {
    if (purchase.status === "fulfilled" || purchase.status === "payment_verified") return purchase;
    throw new Error(`Purchase is not awaiting payment (status: ${purchase.status})`);
  }

  const already = await PackagePurchase.findOne({ paymentTxHash: txHash });
  if (already) throw new Error("This transaction has already been used for a purchase");

  const { verifiedAmount } = await verifyPackageUsdcPayment({
    txHash,
    expectedUsdAmount: purchase.priceUSD,
  });

  purchase.paymentTxHash = txHash;
  purchase.paidAmountUSDC = verifiedAmount;
  purchase.paidAt = new Date();
  purchase.status = "payment_verified";
  await purchase.save();

  return fulfillPackagePurchase(purchase._id);
}

/**
 * Validate a package is actually purchasable and create a purchase intent
 * (payment not collected yet — this is what a payment-intent controller
 * reads to know the amount and productId/packageId to put in Stripe metadata,
 * or what a crypto checkout page polls for its USDC amount).
 */
export async function createPackagePurchaseIntent({ packageId, userId, buyerWallet, acknowledgement }) {
  if (!buyerWallet) throw new Error("buyerWallet required");

  const pkg = await Package.findById(packageId);
  if (!pkg) throw new Error("Package not found");
  if (pkg.status !== "active") throw new Error(`Package is not active (status: ${pkg.status})`);
  if (pkg.type === "bundle" && !pkg.pricingValid) {
    throw new Error("This package's pricing is stale, an admin needs to revalidate it");
  }

  const purchase = await PackagePurchase.create({
    packageId: pkg._id,
    packageName: pkg.name,
    packageType: pkg.type,
    userId,
    acknowledgement,
    buyerWallet: String(buyerWallet).toLowerCase(),
    priceUSD: pkg.priceUSD,
    items: pkg.type === "bundle"
      ? pkg.items.map((i) => ({
          parentId: i.parentId,
          subCollectionId: i.subCollectionId,
          name: i.name,
          image: i.image,
          assetType: i.assetType,
          allocatedPriceUSD: i.allocatedPriceUSD,
        }))
      : [],
    resourceRewards: pkg.type === "reward" ? pkg.resourceRewards : [],
    rewardFulfillment: pkg.type === "reward" && pkg.mintReward
      ? {
          assetType: pkg.mintReward.assetType,
          name: pkg.mintReward.name,
          gmbbTargetUSD: pkg.mintReward.gmbbTargetUSD,
        }
      : null,
    reservationExpiresAt: new Date(Date.now() + RESERVATION_TTL_MS),
  });

  if (pkg.type === "bundle") {
    pkg.reservedCount += 1;
    await pkg.save();
  }

  return purchase;
}

/**
 * Called once payment is confirmed (Stripe webhook, or a crypto-payment
 * verifier). Idempotent: re-running on an already-fulfilled purchase is a
 * no-op, matching finalizeNFAPurchase's own pattern elsewhere.
 */
export async function fulfillPackagePurchase(purchaseId) {
  const claimed = await PackagePurchase.findOneAndUpdate(
    {
      _id: purchaseId,
      status: { $in: ["payment_verified", "partially_fulfilled", "failed"] },
      $or: [{ lockedAt: null }, { lockedAt: { $lt: new Date(Date.now() - LOCK_TTL_MS) } }],
    },
    { status: "fulfilling", lockedAt: new Date(), fulfillmentStartedAt: new Date() },
    { new: true },
  );
  if (!claimed) {
    const existing = await PackagePurchase.findById(purchaseId);
    if (existing?.status === "fulfilled") return existing; // already done, fine
    throw new Error("Purchase is not in a fulfillable state (already running, or wrong status)");
  }

  const purchase = claimed;
  try {
    if (purchase.packageType === "bundle") {
      await fulfillBundleItems(purchase);
    } else {
      await fulfillRewardPack(purchase);
    }
  } catch (err) {
    purchase.status = "failed";
    purchase.lockedAt = null;
    await purchase.save();
    throw err;
  }

  return purchase;
}

async function fulfillBundleItems(purchase) {
  let anyFailed = false;
  for (const item of purchase.items) {
    if (item.status === "fulfilled") continue;
    item.status = "processing";
    item.attempts += 1;
    item.lastAttemptAt = new Date();
    await purchase.save();

    try {
      const result = await finalizeNFAPurchase({
        parentId: String(item.parentId),
        subCollectionId: item.subCollectionId,
        buyerWallet: purchase.buyerWallet,
        priceETH: item.allocatedPriceUSD,
        paymentProvider: purchase.paymentMethod,
        paymentIntentId: purchase.paymentIntentId,
      });
      item.status = "fulfilled";
      item.tokenId = result?.tokenId ?? null;
      item.fulfilledAt = new Date();
    } catch (err) {
      anyFailed = true;
      item.status = "failed";
      item.errorCode = err.code || "";
      item.errorMessage = err.message;
    }
  }

  purchase.status = anyFailed
    ? (purchase.items.some((i) => i.status === "fulfilled") ? "partially_fulfilled" : "failed")
    : "fulfilled";
  purchase.fulfillmentCompletedAt = purchase.status === "fulfilled" ? new Date() : null;
  purchase.lockedAt = null;
  await purchase.save();
}

async function fulfillRewardPack(purchase) {
  // HB has a real ledger — credit it properly. Anything else is recorded on
  // the purchase row only; there is nowhere else to put it today.
  const hbReward = purchase.resourceRewards.find((r) => r.resource === "HB");
  if (hbReward?.amount > 0) {
    const already = await HBLedger.findOne({ reference: String(purchase._id) });
    if (!already) {
      const user = await User.findByIdAndUpdate(
        purchase.userId,
        { $inc: { hyperBucks: hbReward.amount } },
        { new: true, runValidators: false },
      );
      if (user) {
        await HBLedger.create({
          userId: purchase.userId,
          type: "earn",
          amount: hbReward.amount,
          balanceAfter: user.hyperBucks,
          description: `Package reward: ${purchase.packageName}`,
          reference: String(purchase._id),
        });
      }
    }
  }

  if (purchase.rewardFulfillment) {
    await mintRewardItem(purchase);
  }

  purchase.status = "fulfilled";
  purchase.fulfillmentCompletedAt = new Date();
  purchase.lockedAt = null;
  await purchase.save();
}

async function mintRewardItem(purchase) {
  const rf = purchase.rewardFulfillment;
  if (rf.status === "fulfilled") return;

  try {
    const { buybackAmount } = computeRewardPackSplit({
      packagePriceUSD: purchase.priceUSD,
      gmbbTargetUSD: rf.gmbbTargetUSD,
    });

    const { nftContract, wallet: backendWalletObj, provider } = getBlockchain(ACTIVE_CHAIN_ID);
    const backendWallet = await backendWalletObj.getAddress();
    const balance = await provider.getBalance(backendWallet);
    if (balance === 0n) throw new Error("Backend wallet has no ETH for gas");

    const currentNonce = await provider.getTransactionCount(backendWallet, "latest");
    const tokenURI = `ipfs://package-reward-${Date.now()}`;
    const mintTx = await nftContract.mint(backendWallet, tokenURI, 500, { nonce: currentNonce });
    const mintReceipt = await mintTx.wait();

    let tokenId;
    for (const log of mintReceipt.logs) {
      try {
        if (log.address.toLowerCase() !== nftContract.target.toLowerCase()) continue;
        const parsed = nftContract.interface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsed && (parsed.name === "Transfer" || parsed.name === "Minted")) {
          tokenId = Number(parsed.args[parsed.name === "Transfer" ? 2 : 1]);
          break;
        }
      } catch { /* not this contract's log */ }
    }
    if (tokenId === undefined) throw new Error("Failed to read tokenId from mint transaction");

    const transferTx = await nftContract.transferFrom(backendWallet, purchase.buyerWallet, tokenId, {
      nonce: currentNonce + 1,
    });
    await transferTx.wait();

    const markTx = await nftContract.markAsSold(tokenId, { nonce: currentNonce + 2 });
    await markTx.wait();

    // Record the item exactly like any other minted item, under a parent
    // NFTSystem doc scoped to this package (created lazily, one per package).
    const parent = await getOrCreatePackageRewardParent(purchase);
    parent.subCollections.push({
      name: rf.name,
      assetType: rf.assetType,
      isNFA: rf.assetType === "NFA",
      tokenId,
      tokenURI,
      owner: purchase.buyerWallet,
      listed: false,
      priceETH: purchase.priceUSD,
      isFirstSale: false, // it was never sold on its own, no first-sale scenario applies
      minimumBuybackUSD: buybackAmount,
      salesHistory: [{
        buyer: purchase.buyerWallet,
        seller: "admin",
        priceETH: purchase.priceUSD,
        isFirstSale: false,
        createdAt: new Date(),
      }],
    });
    parent.markModified("subCollections");
    await parent.save();
    const savedSub = parent.subCollections[parent.subCollections.length - 1];

    // buybackAmount is tracked on rewardFulfillment.gmbbAmount below — same
    // off-chain-only tracking every other GMBB credit uses today (contract
    // not wired in yet).
    const companyAmount = round2(purchase.priceUSD - buybackAmount);
    if (companyAmount > 0) {
      dispatchRoyalty({
        subCollectionId: String(savedSub._id),
        parentId: String(parent._id),
        creatorWallet: process.env.PLATFORM_WALLET_ADDRESS,
        amount: companyAmount,
        saleRecordId: `package_${purchase._id}`,
        note: `Package sale revenue — ${purchase.packageName}`,
      }).catch((err) => console.warn("Package revenue dispatch error:", err.message));
    }

    rf.status = "fulfilled";
    rf.parentId = parent._id;
    rf.subCollectionId = String(savedSub._id);
    rf.tokenId = tokenId;
    rf.txHash = transferTx.hash;
    rf.gmbbAmount = buybackAmount;
  } catch (err) {
    rf.status = "failed";
    rf.errorMessage = err.message;
    throw err;
  }
}

// One parent NFTSystem doc per package acts as the home for that package's
// minted reward items, the same way any other collection groups its items.
async function getOrCreatePackageRewardParent(purchase) {
  const existing = await NFTSystem.findOne({ "collection.name": `__package_rewards_${purchase.packageId}` });
  if (existing) return existing;
  return NFTSystem.create({
    collection: {
      name: `__package_rewards_${purchase.packageId}`,
      creator: "admin",
      owner: "admin",
    },
    isParentCollection: true,
    isDummy: false,
    subCollections: [],
  });
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
