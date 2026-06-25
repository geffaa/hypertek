import NFTSystem from "../Models/NFTSystem.js";
import Artist from "../Models/Artist.js";
import Activity from "../Models/ActivityModel.js";
import MarketListing from "../Models/MarketListingModel.js";
import { getBlockchain, ethers } from "./blockchain.js";
import { dispatchRoyalty } from "../services/RoyaltyService.js";
import { cancelSiblingListings } from "../services/cancelSiblingListings.js";
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
    console.error(` [finalizeNFAPurchase] Parent collection NOT FOUND for subCollectionId: ${cleanSubId}`);
    throw new Error("Parent collection not found");
  }

  console.log(`🔍 [finalizeNFAPurchase] Found parent: ${parent._id}. Looking for sub-collection: ${cleanSubId}`);
  const subCollection = parent.subCollections.id(cleanSubId);
  if (!subCollection) {
    console.error(` [finalizeNFAPurchase] Sub-collection NOT FOUND in parent: ${parent._id}`);
    throw new Error("Sub-collection not found");
  }

  console.log("[finalizeNFAPurchase] Found parent and sub-collection.");

  // 2. Mint if not already minted
  let tokenId = subCollection.tokenId;
  let receiptHash = txHash;
  // Edition (maxSupply > 1) templates are never minted/owned themselves — each
  // buyer gets their own freshly-minted token (see project edition model).
  const isEdition = (subCollection.maxSupply || 1) > 1;
  let mintedTokenURI = subCollection.tokenURI || null;

  // Resolve artist/creator wallet before minting (used in mint call below)
  let creatorWallet = "admin";
  let royaltyPaymentType = "crypto";
  if (subCollection.artistId) {
    try {
      const artist = await Artist.findById(subCollection.artistId).lean();
      if (artist) {
        royaltyPaymentType = artist.paymentPreference || "crypto";
        creatorWallet = royaltyPaymentType === "crypto"
          ? (artist.walletAddress || "admin")
          : "admin";
      }
    } catch (e) {
      console.warn("⚠️ Could not fetch artist for creator address:", e.message);
    }
  }

  if (!tokenId) {
    console.log("🎨 Minting NFT for purchase...");
    const chainId = 8453; // Base Mainnet
    const { nftContract, wallet: backendWalletObj, provider } = getBlockchain(chainId);

    const backendWallet = await backendWalletObj.getAddress();
    const balance = await provider.getBalance(backendWallet);
    if (balance === 0n) throw new Error("Backend wallet has no ETH for gas");

    const tokenURI = `ipfs://auto-${Date.now()}`;
    const royaltyBps = 500;

    // Fetch latest nonce
    const currentNonce = await provider.getTransactionCount(backendWallet, "latest");

    // Mint — contract signature: mint(address creator, string tokenURI, uint16 royaltyBps)
    const creatorAddress = creatorWallet && creatorWallet !== "admin" ? creatorWallet : backendWallet;
    const tx = await nftContract.mint(creatorAddress, tokenURI, royaltyBps, { nonce: currentNonce });
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

    // Update sub-collection props — only a single item's template adopts the
    // tokenId. Edition templates stay unminted (the buyer copy carries it).
    mintedTokenURI = tokenURI;
    if (!isEdition) {
      subCollection.tokenId = tokenId;
      subCollection.tokenURI = tokenURI;
    }
  } else {
    // If already minted, ensure ownership transfer on chain if needed?
    // Usually for secondary sales, the Marketplace handles this on-chain.
    // But for Stripe "Buy Now" on already minted items, we might need backend to transfer if backend owns it.
    // If subCollection.owner is the platform, we should transfer.
    const platformWallet = (process.env.PLATFORM_WALLET_ADDRESS || "").toLowerCase();
    if (subCollection.owner.toLowerCase() === platformWallet || subCollection.owner.toLowerCase() === "admin") {
      console.log("📦 Transferring already minted NFT from platform to buyer...");
      const chainId = 84532; // Base Sepolia Testnet
      const { nftContract, wallet: backendWalletObj } = getBlockchain(chainId);
      const backendWallet = await backendWalletObj.getAddress();

      const transferTx = await nftContract.transferFrom(backendWallet, buyerWallet, tokenId);
      await transferTx.wait();
      receiptHash = transferTx.hash;
    }
  }

  // 3. Finalize creator wallet resolution (apply bank sentinel + fallback)
  if (subCollection.artistId) {
    if (royaltyPaymentType === "bank") {
      creatorWallet = "bank";
    }
    console.log(`🎨 [Artist] resolved creator: ${royaltyPaymentType} → ${creatorWallet}`);
  } else {
    // Fallback: legacy royaltyWallet on parent collection
    creatorWallet = parent.collection?.royaltyWallet || parent.collection?.owner || "admin";
  }

  // 3. Record Sale in Database
  const seller = (subCollection.owner && subCollection.owner.toLowerCase() !== "admin")
    ? subCollection.owner
    : (process.env.PLATFORM_WALLET_ADDRESS || "admin");

  const cleanPrice = parseFloat(String(priceETH || subCollection.priceETH || 0));

  // Resolve assetType — use new field, fall back to legacy isNFA boolean
  const assetType = subCollection.assetType || (subCollection.isNFA ? "NFA" : "NFT");
  const isNFA = assetType === "NFA";
  const isHypertekCreator = parent.collection?.creator === "admin";
  const isFirstSale = subCollection.isFirstSale === true;

  // Hypertek first sale = admin created AND this is the first sale
  // Player first sale   = user created AND this is the first sale
  const isHypertekFirstSale = isFirstSale && isHypertekCreator;
  const isPlayerFirstSale = isFirstSale && !isHypertekCreator;

  // Enforce reserve price: block purchases below minimumBuybackUSD for NFA and NFC
  if ((isNFA || assetType === "NFC") && subCollection.minimumBuybackUSD > 0 && cleanPrice < subCollection.minimumBuybackUSD) {
    throw Object.assign(
      new Error(`Price $${cleanPrice} is below this ${assetType}'s minimum buyback of $${subCollection.minimumBuybackUSD}. Cannot sell below guaranteed value.`),
      { code: "BELOW_RESERVE", minimumBuybackUSD: subCollection.minimumBuybackUSD }
    );
  }

  /**
   * Commission distribution per Don's rules:
   *
   * NFA — Hypertek first sale:   bank preset minBB (from seller portion) | 4% artist | 16% Hypertek | rest to Hypertek as seller
   * NFA — owner resell (2nd+):   80% seller | 4% artist | 5% → +minBB | 11% Hypertek
   *
   * NFC — Hypertek first sale:   bank preset minBB (from seller portion) | 4% artist | 16% Hypertek | rest to Hypertek as seller
   * NFC — player first sale:     80% creator | 10% banked as initial minBB | 10% Hypertek
   * NFC — owner resell (2nd+):   80% seller | 4% artist | 5% → +minBB | 11% Hypertek
   *
   * NFT — player first sale:     80% creator | 10% banked as initial minBB | 10% Hypertek
   * NFT — owner resell (2nd+):   80% seller | 4% artist | 5% → +minBB | 11% Hypertek
   */

  let royaltyPaid = 0;
  let platformFee = 0;
  let buybackAmount = 0;  // amount added to minBB or banked
  let companyAmount = 0;
  let sellerReceived = 0;

  if (isHypertekFirstSale) {
    // Hypertek is both seller and platform — bank preset minBB from seller portion
    // Commission: 4% artist + 16% Hypertek = 20%
    royaltyPaid = parseFloat((cleanPrice * 0.04).toFixed(6));
    companyAmount = parseFloat((cleanPrice * 0.16).toFixed(6));
    platformFee = parseFloat((cleanPrice * 0.20).toFixed(6));
    // Hypertek as seller gets the remaining 80%; minBB is already preset/banked by admin
    sellerReceived = parseFloat((cleanPrice * 0.80).toFixed(6));
    buybackAmount = 0; // preset minBB — no auto-increment on first sale
    console.log(`💼 [Commission] Hypertek first sale (${assetType}): 4% artist + 16% company. MinBB preset.`);

  } else if (isPlayerFirstSale) {
    // Player first sale: 80% to creator, 10% banked as initial minBB, 10% Hypertek
    sellerReceived = parseFloat((cleanPrice * 0.80).toFixed(6));
    royaltyPaid = 0; // Creator IS the seller — no separate artist fee
    buybackAmount = parseFloat((cleanPrice * 0.10).toFixed(6)); // initial minBB seed
    companyAmount = parseFloat((cleanPrice * 0.10).toFixed(6));
    platformFee = parseFloat((cleanPrice * 0.20).toFixed(6));
    console.log(`🎮 [Commission] Player first sale (${assetType}): 80% creator + 10% minBB + 10% company.`);

  } else {
    // Owner resell (2nd+ sale) — applies to NFA, NFC, NFT equally
    sellerReceived = parseFloat((cleanPrice * 0.80).toFixed(6));
    royaltyPaid = parseFloat((cleanPrice * 0.04).toFixed(6));
    buybackAmount = parseFloat((cleanPrice * 0.05).toFixed(6)); // added to minBB
    companyAmount = parseFloat((cleanPrice * 0.11).toFixed(6));
    platformFee = parseFloat((cleanPrice * 0.20).toFixed(6));
    console.log(`🔄 [Commission] Owner resell (${assetType}): 80% seller + 4% artist + 5% minBB + 11% company.`);
  }

  // MinBB auto-increment — grows on resales and player first sales (not on Hypertek first sale)
  if (buybackAmount > 0 && cleanPrice > 0) {
    subCollection.minimumBuybackUSD = parseFloat(
      ((subCollection.minimumBuybackUSD || 0) + buybackAmount).toFixed(2)
    );
    console.log(`🏦 [Buyback] ${assetType} minimumBuybackUSD updated to $${subCollection.minimumBuybackUSD}`);
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

  if (isEdition) {
    // Edition: template keeps selling — only move the supply counter and give
    // the buyer their own owned copy (so it appears in their profile).
    subCollection.currentSupply = (subCollection.currentSupply || 0) + 1;
    subCollection.isFirstSale = false;

    const soldOut = subCollection.currentSupply >= (subCollection.maxSupply || 1);
    if (soldOut) {
      subCollection.listed = false;
      subCollection.priceETH = 0;
    }

    MarketListing.findOneAndUpdate(
      { subCollectionId: subCollection._id.toString(), status: "active" },
      {
        $inc: { quantitySold: 1, quantityRemaining: -1 },
        ...(soldOut ? { status: "sold" } : {}),
      },
    ).catch((e) => console.warn("[Edition purchase] MarketListing sync error:", e.message));

    parent.subCollections.push({
      name: subCollection.name,
      symbol: subCollection.symbol,
      image: subCollection.image,
      description: subCollection.description,
      tokenId: tokenId,
      tokenURI: mintedTokenURI,
      owner: buyerWallet.toLowerCase(),
      listed: false,
      priceETH: 0,
      isFirstSale: false,
      assetType: subCollection.assetType,
      isNFA: subCollection.isNFA,
      nfaFrame: subCollection.nfaFrame,
      artistId: subCollection.artistId,
      maxSupply: 1,
      currentSupply: 1,
      salesHistory: [saleRecord],
    });
  } else {
    // Single item: transfer the template to the buyer and delist.
    if (!subCollection.salesHistory) subCollection.salesHistory = [];
    subCollection.salesHistory.push(saleRecord);

    subCollection.owner = buyerWallet.toLowerCase();
    subCollection.seller = null; // Clear listing info
    subCollection.buyer = null;
    subCollection.listed = false;
    subCollection.priceETH = 0;
    subCollection.isFirstSale = false;
  }

  parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;

  console.log("💾 [finalizeNFAPurchase] Saving parent document...");
  parent.markModified('subCollections');
  await parent.save();

  console.log(`[finalizeNFAPurchase] COMPLETED! Token #${tokenId} owner is now ${buyerWallet}`);

  // Write to Activity log (non-blocking)
  Activity.create({
    name: subCollection.name || parent.name || "NFT",
    image: subCollection.image || null,
    type: "Sale",
    buyer: buyerWallet.toLowerCase(),
    seller: seller.toLowerCase(),
    price: cleanPrice,
    time: new Date(),
    itemType: assetType,
    itemId: parent._id,
  }).catch(err => console.warn("⚠️ [Activity] create error:", err.message));

  // Dispatch creator/artist royalty (4%) — async, non-blocking
  if (royaltyPaid > 0 && creatorWallet && creatorWallet !== "admin") {
    dispatchRoyalty({
      subCollectionId: cleanSubId,
      parentId: cleanParentId,
      artistId: subCollection.artistId,
      creatorWallet,
      amount: royaltyPaid,
      saleRecordId: receiptHash || paymentIntentId,
      paymentType: royaltyPaymentType,
      payoutType: "artist_royalty",
      note: `${assetType} artist royalty 4%`,
    }).catch(err => console.warn("⚠️ [RoyaltyService] royalty dispatch error:", err.message));
  }

  // Dispatch buyback fund → BUYBACK_WALLET_ADDRESS — async, non-blocking
  if (buybackAmount > 0) {
    const buybackWallet = process.env.BUYBACK_WALLET_ADDRESS;
    if (buybackWallet) {
      const bbPct = isPlayerFirstSale ? '10%' : '5%';
      dispatchRoyalty({
        subCollectionId: cleanSubId,
        parentId: cleanParentId,
        creatorWallet: buybackWallet,
        amount: buybackAmount,
        saleRecordId: receiptHash || paymentIntentId,
        payoutType: "buyback_fund",
        note: `${assetType} buyback fund ${bbPct}`,
      }).catch(err => console.warn("⚠️ [BuybackService] dispatch error:", err.message));
      console.log(`🏦 [Buyback] Dispatching $${buybackAmount} USDC → ${buybackWallet}`);
    } else {
      console.warn("⚠️ [Buyback] BUYBACK_WALLET_ADDRESS not set — skipping dispatch");
    }
  }

  // Dispatch company/platform fee → PLATFORM_WALLET_ADDRESS — async, non-blocking
  if (companyAmount > 0) {
    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
    if (platformWallet) {
      const feeLabel = isHypertekFirstSale ? '16%' : isPlayerFirstSale ? '10%' : '11%';
      dispatchRoyalty({
        subCollectionId: cleanSubId,
        parentId: cleanParentId,
        creatorWallet: platformWallet,
        amount: companyAmount,
        saleRecordId: receiptHash || paymentIntentId,
        payoutType: "company_fee",
        note: `${assetType} company fee ${feeLabel}`,
      }).catch(err => console.warn("⚠️ [PlatformFee] dispatch error:", err.message));
      console.log(`🏢 [Platform] Dispatching $${companyAmount} USDC → ${platformWallet}`);
    } else {
      console.warn("⚠️ [Platform] PLATFORM_WALLET_ADDRESS not set — skipping company fee dispatch");
    }
  }

  // Cancel any active sibling listings (auction / marketplace / trade) for this item
  cancelSiblingListings(cleanSubId, {
    itemName: subCollection.name,
    ownerWallet: seller,
  }).catch(() => { });

  console.log("NFA Purchase Finalized for Token #", tokenId);
  return { success: true, tokenId, subCollection };
}
