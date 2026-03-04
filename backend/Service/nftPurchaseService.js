import NFTSystem from "../Models/NFTSystem.js";
import { getBlockchain, ethers } from "./blockchain.js";
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" });

/**
 * Shared logic to finalize an NFA purchase (mint if needed, transfer, record sale)
 */
export async function finalizeNFAPurchase({
  parentId,
  subCollectionId,
  buyerWallet,
  priceETH, // Price in human-readable decimal (e.g., 0.01)
  txHash,   // Frontend provides this for USDC, backend provides this for Stripe? 
            // Actually Stripe doesn't have a blockchain tx hash yet if we mint here.
  paymentProvider, // 'crypto' or 'stripe'
  paymentIntentId // For stripe tracking
}) {
  console.log("🚀 [finalizeNFAPurchase] STARTING finalization...");
  console.log("📍 Metadata:", {
    parentId: parentId ? String(parentId) : "",
    subCollectionId: subCollectionId ? String(subCollectionId) : "",
    buyerWallet: buyerWallet ? String(buyerWallet) : "",
    priceETH: priceETH ? String(priceETH) : "",
    paymentProvider: paymentProvider ? String(paymentProvider) : "",
    paymentIntentId: paymentIntentId ? String(paymentIntentId) : ""
  });

  // Clean up metadata
  const isInvalid = (val) => !val || val === "undefined" || val === "not_set" || val === "null" || val === "";
  
  const cleanParentId = isInvalid(parentId) ? null : parentId;
  const cleanSubId = isInvalid(subCollectionId) ? null : subCollectionId;
  const cleanBuyer = isInvalid(buyerWallet) ? null : buyerWallet;
  const cleanItemType = isInvalid(paymentProvider === 'stripe' ? 'nft' : 'game') ? 'nft' : 'nft'; // Force nft for this service?

  if (!cleanSubId || !cleanBuyer) {
    console.warn("⚠️ [finalizeNFAPurchase] Missing or invalid critical metadata (subCollectionId or buyerWallet), skipping NFA update.");
    console.log("Details after cleaning:", { cleanSubId, cleanBuyer });
    return { success: false, error: "Missing metadata" };
  }
  // 1. Find parent and sub-collection
  let parent;
  if (cleanParentId) {
    console.log(`🔍 [finalizeNFAPurchase] Looking for parent by ID: ${cleanParentId}`);
    parent = await NFTSystem.findById(cleanParentId);
  }

  if (!parent && cleanSubId) {
    console.log(`🔍 [finalizeNFAPurchase] Parent not found by ID or parentId missing. Searching by subCollectionId: ${cleanSubId}`);
    parent = await NFTSystem.findOne({ "subCollections._id": cleanSubId });
  }

  if (!parent) {
    console.error(`❌ [finalizeNFAPurchase] Parent collection NOT FOUND for subCollectionId: ${cleanSubId}`);
    throw new Error("Parent collection not found");
  }

  console.log(`🔍 [finalizeNFAPurchase] Found parent: ${parent._id}. Looking for sub-collection: ${cleanSubId}`);
  const subCollection = parent.subCollections.id(cleanSubId);
  if (!subCollection) {
    console.error(`❌ [finalizeNFAPurchase] Sub-collection NOT FOUND in parent: ${parent._id}`);
    throw new Error("Sub-collection not found");
  }

  console.log("✅ [finalizeNFAPurchase] Found parent and sub-collection.");

  // 2. Mint if not already minted
  let tokenId = subCollection.tokenId;
  let receiptHash = txHash;

  if (!tokenId) {
    console.log("🎨 Minting NFT for purchase...");
    const chainId = 84532; // Default to Base Sepolia
    const { nftContract, wallet: backendWalletObj, provider } = getBlockchain(chainId);
    
    const backendWallet = await backendWalletObj.getAddress();
    const balance = await provider.getBalance(backendWallet);
    if (balance === 0n) throw new Error("Backend wallet has no ETH for gas");

    const tokenURI = `ipfs://auto-${Date.now()}`;
    const royaltyBps = 500;
    
    // Fetch latest nonce
    const currentNonce = await provider.getTransactionCount(backendWallet, "latest");
    
    // Mint
    const tx = await nftContract.mint(tokenURI, royaltyBps, { nonce: currentNonce });
    const receipt = await tx.wait();
    receiptHash = receipt.hash; // Use this as txHash if it was a new mint

    // Find tokenId in logs
    for (const log of receipt.logs) {
      try {
        if (log.address.toLowerCase() !== nftContract.target.toLowerCase()) continue;
        const parsed = nftContract.interface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
        if (parsed && (parsed.name === "Transfer" || parsed.name === "Minted")) {
          tokenId = Number(parsed.args[parsed.name === "Transfer" ? 2 : 1]);
          break;
        }
      } catch (e) {
        console.warn("Log parsing warning:", e.message);
      }
    }

    if (tokenId === undefined) throw new Error("Failed to retrieve Token ID from mint transaction");

    // Transfer to buyer
    const transferTx = await nftContract.transferFrom(
      backendWallet,
      buyerWallet,
      tokenId,
      { nonce: currentNonce + 1 }
    );
    await transferTx.wait();

    // Mark as sold on contract
    const markTx = await nftContract.markAsSold(tokenId, { nonce: currentNonce + 2 });
    await markTx.wait();

    // Update sub-collection props
    subCollection.tokenId = tokenId;
    subCollection.tokenURI = tokenURI;
  } else {
    // If already minted, ensure ownership transfer on chain if needed?
    // Usually for secondary sales, the Marketplace handles this on-chain.
    // But for Stripe "Buy Now" on already minted items, we might need backend to transfer if backend owns it.
    // If subCollection.owner is the platform, we should transfer.
    const platformWallet = (process.env.PLATFORM_WALLET_ADDRESS || "").toLowerCase();
    if (subCollection.owner.toLowerCase() === platformWallet || subCollection.owner.toLowerCase() === "admin") {
      console.log("📦 Transferring already minted NFT from platform to buyer...");
      const chainId = 84532;
      const { nftContract, wallet: backendWalletObj } = getBlockchain(chainId);
      const backendWallet = await backendWalletObj.getAddress();
      
      const transferTx = await nftContract.transferFrom(backendWallet, buyerWallet, tokenId);
      await transferTx.wait();
      receiptHash = transferTx.hash;
    }
  }

  // 3. Record Sale in Database
  const creatorWallet = parent.collection?.royaltyWallet || parent.collection?.owner || "admin";
  const seller = (subCollection.owner && subCollection.owner.toLowerCase() !== "admin") 
    ? subCollection.owner 
    : (process.env.PLATFORM_WALLET_ADDRESS || "admin");

  const cleanPrice = parseFloat(String(priceETH || subCollection.priceETH || 0));
  
  // Calculate distribution based on recordSubCollectionSale logic
  const PLATFORM_FEE_PERCENT = 10;
  const CREATOR_ROYALTY_PERCENT = 5;
  
  let royaltyPaid = 0;
  let platformFee = 0;
  let sellerReceived = 0;

  if (subCollection.isFirstSale) {
    royaltyPaid = cleanPrice;
    platformFee = 0;
    sellerReceived = 0;
  } else {
    royaltyPaid = (cleanPrice * CREATOR_ROYALTY_PERCENT) / 100;
    platformFee = (cleanPrice * PLATFORM_FEE_PERCENT) / 100;
    sellerReceived = cleanPrice - royaltyPaid - platformFee;
  }

  const saleRecord = {
    buyer: buyerWallet.toLowerCase(),
    seller: seller.toLowerCase(),
    priceETH: cleanPrice,
    royaltyPaid: parseFloat(royaltyPaid.toFixed(6)),
    platformFee: parseFloat(platformFee.toFixed(6)),
    sellerReceived: parseFloat(sellerReceived.toFixed(6)),
    txHash: receiptHash || paymentIntentId || "stripe_payment",
    isFirstSale: subCollection.isFirstSale,
    createdAt: new Date(),
  };

  if (!subCollection.salesHistory) subCollection.salesHistory = [];
  subCollection.salesHistory.push(saleRecord);
  
  subCollection.owner = buyerWallet.toLowerCase();
  subCollection.seller = null; // Clear listing info
  subCollection.buyer = null;
  subCollection.listed = false;
  subCollection.priceETH = 0;
  subCollection.isFirstSale = false;

  parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;
  
  console.log("💾 [finalizeNFAPurchase] Saving parent document...");
  parent.markModified('subCollections');
  await parent.save();

  console.log(`✅ [finalizeNFAPurchase] COMPLETED! Token #${tokenId} owner is now ${buyerWallet}`);

  console.log("✅ NFA Purchase Finalized for Token #", tokenId);
  return { success: true, tokenId, subCollection };
}
