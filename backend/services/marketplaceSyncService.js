// services/marketplaceSyncService.js
// Ground-truth verification for marketplace sales, mirroring transakService's role for
// Transak orders: the frontend's post-purchase POST is a fast-path UX trigger only, never
// trusted blindly. Everything here reads from the chain (NFTSold event logs), never from
// request bodies, so a sale can only ever be recorded if it actually happened on-chain.
import { getBlockchain, ethers } from "../Service/blockchain.js";

// Verify a specific transaction actually contains a matching NFTSold event before letting
// recordSubCollectionSale touch the DB. Returns the chain's own values for buyer/seller/price
// so callers use verified data, not whatever the client claimed.
export async function verifySaleOnChain({ chainId, tokenId, buyer, seller, txHash }) {
  if (!txHash) return { verified: false, reason: "Missing txHash" };

  const { provider, marketContract } = getBlockchain(chainId);

  let receipt;
  try {
    receipt = await provider.getTransactionReceipt(txHash);
  } catch (err) {
    return { verified: false, reason: `Could not fetch transaction receipt: ${err.message}` };
  }
  if (!receipt || receipt.status !== 1) {
    return { verified: false, reason: "Transaction not found or not successful on-chain" };
  }

  const marketAddress = (await marketContract.getAddress()).toLowerCase();

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== marketAddress) continue;

    let parsed;
    try {
      parsed = marketContract.interface.parseLog(log);
    } catch {
      continue; // not a log our ABI recognizes
    }
    if (parsed?.name !== "NFTSold") continue;

    const ev = parsed.args;
    if (String(ev.tokenId) !== String(tokenId)) continue;
    if (buyer && ev.buyer.toLowerCase() !== buyer.toLowerCase()) continue;
    if (seller && ev.seller.toLowerCase() !== seller.toLowerCase()) continue;

    return {
      verified: true,
      event: {
        buyer: ev.buyer,
        seller: ev.seller,
        nftAddress: ev.nftAddress,
        tokenId: Number(ev.tokenId),
        priceUSDC: parseFloat(ethers.formatUnits(ev.price, 6)),
        isFirstSale: ev.isFirstSale,
        txHash,
        blockNumber: receipt.blockNumber,
      },
    };
  }

  return { verified: false, reason: "No matching NFTSold event found in this transaction" };
}

// Reconcile path: scan a block range for NFTSold events that never made it into the DB
// (the empty-catch{} failure mode). `alreadyRecordedTxHashes` is a Set/array of txHashes
// already present in some subCollection's salesHistory — anything else found here means the
// frontend's POST never arrived or failed silently.
export async function findUnprocessedSales({ chainId, fromBlock, toBlock, alreadyRecordedTxHashes }) {
  const { marketContract } = getBlockchain(chainId);
  const events = await marketContract.queryFilter(
    marketContract.filters.NFTSold(),
    fromBlock,
    toBlock,
  );
  const seen = new Set(alreadyRecordedTxHashes || []);

  return events
    .filter((e) => !seen.has(e.transactionHash))
    .map((e) => ({
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
      buyer: e.args.buyer,
      seller: e.args.seller,
      nftAddress: e.args.nftAddress,
      tokenId: Number(e.args.tokenId),
      priceUSDC: parseFloat(ethers.formatUnits(e.args.price, 6)),
      isFirstSale: e.args.isFirstSale,
    }));
}
