// services/marketplaceReconcileJob.js
// The authoritative path: scans on-chain NFTSold events directly and applies any sale that
// never made it into the DB (the frontend's empty catch{} failure mode — see Buy1.jsx). Reuses
// recordSubCollectionSale itself (via a minimal req/res adapter) instead of duplicating its
// distribution/royalty/buyback logic, so both paths (frontend POST and this reconciler) always
// stay in sync.
import NFTSystem from "../Models/NFTSystem.js";
import { recordSubCollectionSale } from "../Controllers/nftController.js";
import { findUnprocessedSales } from "./marketplaceSyncService.js";

async function getAlreadyRecordedTxHashes() {
  const parents = await NFTSystem.find(
    { "subCollections.salesHistory.0": { $exists: true } },
    { "subCollections.salesHistory.txHash": 1 },
  ).lean();

  const txHashes = new Set();
  for (const parent of parents) {
    for (const sub of parent.subCollections || []) {
      for (const sale of sub.salesHistory || []) {
        if (sale.txHash) txHashes.add(sale.txHash);
      }
    }
  }
  return [...txHashes];
}

// Runs recordSubCollectionSale programmatically for a chain-discovered sale, capturing its
// JSON response instead of writing to an HTTP response.
function invokeRecordSale(body) {
  return new Promise((resolve) => {
    const fakeReq = { body };
    const fakeRes = {
      _status: 200,
      status(code) {
        this._status = code;
        return this;
      },
      json(payload) {
        resolve({ status: this._status, payload });
      },
    };
    recordSubCollectionSale(fakeReq, fakeRes).catch((err) =>
      resolve({ status: 500, payload: { success: false, error: err.message } }),
    );
  });
}

// Call periodically (cron) or on-demand (admin endpoint) with a recent block range.
export async function reconcileMarketplaceSales({ chainId = 84532, fromBlock, toBlock = "latest" }) {
  const alreadyRecordedTxHashes = await getAlreadyRecordedTxHashes();
  const missed = await findUnprocessedSales({
    chainId,
    fromBlock,
    toBlock,
    alreadyRecordedTxHashes,
  });

  const results = [];
  for (const sale of missed) {
    const result = await invokeRecordSale({
      tokenId: sale.tokenId,
      buyer: sale.buyer,
      seller: sale.seller,
      priceETH: sale.priceUSDC,
      txHash: sale.txHash,
      chainId,
    });
    results.push({ txHash: sale.txHash, tokenId: sale.tokenId, ...result });
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ [Reconcile] Applied missed sale: token ${sale.tokenId}, tx ${sale.txHash}`);
    } else {
      console.warn(`⚠️ [Reconcile] Could not apply sale: token ${sale.tokenId}, tx ${sale.txHash}`, result.payload);
    }
  }
  return { scanned: missed.length, applied: results.filter((r) => r.status < 300).length, results };
}
