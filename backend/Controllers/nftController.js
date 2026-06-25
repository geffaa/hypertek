// Controllers/nftController.js - COMPLETE VERSION
import fs from "fs";
import path from "path";
import NFTSystem from "../Models/NFTSystem.js";
import {
  getBlockchain,
  ethers,
  formatEther,
} from "../Service/blockchain.js";
import { cloudinary as getCloudinary, isCloudinaryEnabled as getIsCloudinaryEnabled } from "../Config/cloudinary.js";
import { dispatchRoyalty } from "../services/RoyaltyService.js";
import { cancelSiblingListings } from "../services/cancelSiblingListings.js";
import { markOfferCompleted } from "./Offer.js";
import Activity from "../Models/ActivityModel.js";
import MarketListing from "../Models/MarketListingModel.js";
import Trade from "../Models/TradeModel.js";
import Auction from "../Models/AuctionModel.js";
import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";
import { finalizeNFAPurchase } from "../Service/nftPurchaseService.js";
import License from "../Models/License.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: save uploaded image permanently (Cloudinary or local /uploads/nft/)
async function saveImagePermanently(filePath, filename) {
  if (getIsCloudinaryEnabled()) {
    try {
      const result = await getCloudinary().uploader.upload(filePath, {
        folder: "hyper-tek/nft",
      });
      return result.secure_url;
    } finally {
      fs.unlink(filePath, () => { });
    }
  } else {
    const finalDir = path.join(process.cwd(), "uploads", "nft");
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
    fs.renameSync(filePath, path.join(finalDir, filename));
    return `/uploads/nft/${filename}`;
  }
}

/**
 * Create Parent Collection (Characters, Land, etc.)
 */
const VALID_CATEGORIES = [
  "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases",
  "general",
];

export async function createParentCollection(req, res) {
  try {
    const { name, symbol, Type, chain, owner, category } = req.body;

    const userRole = req.user?.Role || req.user?.role;
    const isAdmin = userRole?.toLowerCase() === "admin";
    const creatorType = isAdmin ? "admin" : "user";
    const userId = req.user?._id || req.user?.id || null;

    if (!name || !symbol || !chain || !owner || !category) {
      return res.status(400).json({
        error: "Missing required fields: name, symbol, chain, owner, category",
      });
    }

    const normalizedCategory = category.toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    let image;
    if (req.file) {
      image = await saveImagePermanently(req.file.path, req.file.filename);
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({
        error: "Image is required (file or URL).",
      });
    }

    const doc = await NFTSystem.create({
      userId: userId,
      collection: {
        name,
        symbol,
        Type: Type || "ERC721",
        chain,
        image,
        owner,
        creator: creatorType,
        salesCount: 0,
      },
      category: normalizedCategory,
      isParentCollection: true,
      subCollections: [],
      status: "active",
    });

    return res.json({
      success: true,
      message: `Parent collection "${name}" created`,
      doc,
    });
  } catch (err) {
    console.error(" CREATE PARENT COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Create NFT/NFC item directly — auto-finds or creates parent collection per user+category.
 * This is the single-step user create flow (no separate "create collection" step needed).
 */
export async function createItemDirect(req, res) {
  try {
    const {
      name, description, priceETH, category, assetType, owner,
      // Edition / supply
      maxSupply,
      // Admin-only NFA fields
      minimumBuybackUSD, reservePriceUSD, nfaFrame, royaltyWallet,
    } = req.body;

    const userRole = req.user?.Role || req.user?.role || "";
    const callerIsAdmin = userRole.toLowerCase() === "admin";
    const userId = req.user?._id || req.user?.id || null;

    if (!name?.trim()) return res.status(400).json({ error: "Item name is required" });
    if (!owner) return res.status(400).json({ error: "Wallet address is required" });

    const normalizedCategory = (category || "general").toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({ error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }

    const resolvedType = assetType || "NFT";
    if (!callerIsAdmin && (resolvedType === "NFA" || resolvedType === "NFC")) {
      return res.status(403).json({ error: "Only admins can create NFA or NFC items." });
    }

    let image = "";
    if (req.file) {
      image = await saveImagePermanently(req.file.path, req.file.filename);
    } else if (req.body.image) {
      image = req.body.image;
    }

    // Find or auto-create a parent collection for this user+category.
    // Always scope by owner to prevent cross-user parent pollution when userId is null.
    let parent = await NFTSystem.findOne({
      ...(userId ? { userId } : {}),
      "collection.owner": owner.toLowerCase(),
      category: normalizedCategory,
      isParentCollection: true,
    });

    if (!parent) {
      // Deterministic symbol: catCode (up to 4 chars) + last 4 chars of userId/owner
      // Same inputs always produce the same symbol — no random collision
      const catCode = normalizedCategory.replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase();
      const idSeed = (userId || owner || "").toString().replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase().padStart(4, "0");
      parent = await NFTSystem.create({
        userId,
        collection: {
          name: normalizedCategory,
          symbol: `${catCode}${idSeed}`,
          Type: "ERC721",
          chain: "Base",
          image: "",
          owner: owner.toLowerCase(),
          creator: callerIsAdmin ? "admin" : "user",
          salesCount: 0,
        },
        category: normalizedCategory,
        isParentCollection: true,
        subCollections: [],
        status: "active",
      });
    }

    // Validate NFA admin fields
    if (resolvedType === "NFA" && callerIsAdmin) {
      if (!minimumBuybackUSD || parseFloat(minimumBuybackUSD) <= 0) {
        return res.status(400).json({ error: "NFA requires a Minimum Buyback price (> 0)." });
      }
      if (!reservePriceUSD || parseFloat(reservePriceUSD) <= 0) {
        return res.status(400).json({ error: "NFA requires a Reserve Price (listing price, > 0)." });
      }
      const minBB = parseFloat(minimumBuybackUSD);
      const reserve = parseFloat(reservePriceUSD);
      const maxAllowed = parseFloat((reserve * 0.35).toFixed(2));
      if (minBB > maxAllowed) {
        return res.status(400).json({
          error: `Minimum Buyback ($${minBB}) exceeds the 35% cap of Reserve Price ($${reserve}). Maximum allowed: $${maxAllowed}.`,
        });
      }
    }

    const parsedPrice = priceETH ? parseFloat(priceETH) : 0;
    const parsedMaxSupply = maxSupply ? Math.max(1, parseInt(maxSupply, 10)) : 1;
    const newItem = {
      name: name.trim(),
      description: description?.trim() || "",
      owner: owner.toLowerCase(),
      image,
      priceETH: parsedPrice,
      assetType: resolvedType,
      isNFA: resolvedType === "NFA",
      isFirstSale: true,
      listed: parsedPrice > 0,
      maxSupply: parsedMaxSupply,
      currentSupply: 0,
      createdAt: new Date(),
    };

    // Admin NFA/NFC extra fields
    if (callerIsAdmin) {
      if (minimumBuybackUSD !== undefined && minimumBuybackUSD !== "")
        newItem.minimumBuybackUSD = parseFloat(minimumBuybackUSD);
      if (reservePriceUSD !== undefined && reservePriceUSD !== "")
        newItem.reservePriceUSD = parseFloat(reservePriceUSD);
      if (nfaFrame !== undefined)
        newItem.nfaFrame = nfaFrame || null;
    }

    // Store royalty wallet on parent collection
    if (royaltyWallet?.trim()) {
      parent.collection.royaltyWallet = royaltyWallet.trim().toLowerCase();
    }

    parent.subCollections.push(newItem);
    parent.markModified("subCollections");
    await parent.save();

    const savedItem = parent.subCollections[parent.subCollections.length - 1];

    return res.json({
      success: true,
      message: `"${name}" saved to ${normalizedCategory} storage`,
      item: savedItem,
      parentId: parent._id,
    });
  } catch (err) {
    console.error(" CREATE ITEM DIRECT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Add Sub-Collection to Parent Collection
 */
export async function addSubCollection(req, res) {
  try {
    const { parentId } = req.params;
    const {
      name,
      symbol,
      description,
      priceETH,
      category,
      owner,
      creator,
      Type,
    } = req.body;

    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    if (!parent.isParentCollection) {
      return res.status(400).json({ error: "This is not a parent collection" });
    }

    // Handle image
    let image = req.file
      ? await saveImagePermanently(req.file.path, req.file.filename)
      : req.body.image || parent.collection.image;

    const subCollectionPrice = priceETH || 0;
    const subCollection = {
      name: name || "", // optional now
      symbol: symbol || "", // optional now
      image,
      description: description || "",
      owner: owner || parent.collection.owner || "admin",
      creator: creator || "admin",
      listed: subCollectionPrice > 0,
      priceETH: subCollectionPrice,
      Type: Type || "characters",
      isFirstSale: true,
      salesHistory: [],
      createdAt: new Date(),
    };

    parent.subCollections.push(subCollection);
    await parent.save();

    return res.json({
      success: true,
      message: "Sub-collection added successfully",
      parent,
      newSubCollection: parent.subCollections[parent.subCollections.length - 1],
    });
  } catch (err) {
    console.error(" ADD SUB-COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Parent Collections by Category
 */
export async function getParentCollections(req, res) {
  try {
    const { category, owner } = req.query;

    let query = { isParentCollection: true, status: "active" };

    if (category) {
      // Accept canonical names AND their legacy DB aliases
      const CAT_ALIASES = {
        "military badges": ["military badges", "military badges and collectables"],
        "racing vehicles": ["racing vehicles", "vehicles"],
        "land and bases": ["land and bases", "land/bases"],
      };
      const normalized = category.toLowerCase().trim();
      const searchValues = CAT_ALIASES[normalized] || [normalized];
      query.category = searchValues.length > 1 ? { $in: searchValues } : searchValues[0];
    }

    if (owner) {
      query["collection.owner"] = owner.toLowerCase();
    }

    const collections = await NFTSystem.find(query)
      .select("collection category subCollections createdAt isDummy")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      collections,
      count: collections.length,
    });
  } catch (err) {
    console.error(" GET PARENT COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Sub-Collections from a Parent
 */
export async function getSubCollections(req, res) {
  try {
    const { parentId } = req.params;

    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    return res.json({
      success: true,
      parentCollection: {
        name: parent.collection.name,
        category: parent.category,
        image: parent.collection.image,
      },
      subCollections: parent.subCollections,
      count: parent.subCollections.length,
    });
  } catch (err) {
    console.error(" GET SUB-COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update Sub-Collection
 */
export async function updateSubCollection(req, res) {
  try {
    const { parentId, subCollectionId } = req.params;
    const {
      name, symbol, description, priceETH, listed,
      assetType, isNFA, nfaFrame, minimumBuybackUSD, reservePriceUSD,
      artistId, category,
    } = req.body;

    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    const subCollection = parent.subCollections.id(subCollectionId);
    if (!subCollection) {
      return res.status(404).json({ error: "Sub-collection not found" });
    }

    // ── Category change: move item to the correct parent ──────────────
    if (category) {
      const newCat = category.toLowerCase().trim();
      const currentCat = parent.category?.toLowerCase().trim();
      if (newCat !== currentCat && VALID_CATEGORIES.includes(newCat)) {
        const userId = req.user?._id || req.user?.id || parent.userId || null;
        const owner = subCollection.owner;

        // Find or create new parent for this user+category
        let newParent = await NFTSystem.findOne({
          ...(userId ? { userId } : {}),
          "collection.owner": owner,
          category: newCat,
          isParentCollection: true,
        });
        if (!newParent) {
          const catCode = newCat.replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase();
          const idSeed = (userId || owner || "").toString().replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase().padStart(4, "0");
          newParent = await NFTSystem.create({
            userId,
            collection: { name: newCat, symbol: `${catCode}${idSeed}`, Type: "ERC721", chain: "Base", image: "", owner, creator: "user", salesCount: 0 },
            category: newCat,
            isParentCollection: true,
            subCollections: [],
            status: "active",
          });
        }

        // Update image if provided before moving
        if (req.file) subCollection.image = await saveImagePermanently(req.file.path, req.file.filename);
        if (name) subCollection.name = name;
        if (description !== undefined) subCollection.description = description;

        // Move: remove from current parent, push to new parent
        const subData = subCollection.toObject();
        parent.subCollections.pull({ _id: subCollectionId });
        parent.markModified("subCollections");
        await parent.save();

        newParent.subCollections.push(subData);
        newParent.markModified("subCollections");
        await newParent.save();

        const movedItem = newParent.subCollections[newParent.subCollections.length - 1];
        return res.json({ success: true, message: "Item moved to new category", subCollection: movedItem, newParentId: newParent._id });
      }
    }

    // Determine if caller is admin
    const callerRole = req.user?.Role || req.user?.role || "";
    const callerIsAdmin = callerRole.toLowerCase() === "admin";

    if (name) subCollection.name = name;
    if (symbol) subCollection.symbol = symbol;
    if (description !== undefined) subCollection.description = description;
    if (priceETH !== undefined) subCollection.priceETH = parseFloat(priceETH);
    if (listed !== undefined) subCollection.listed = listed;

    // Asset type — admin-only field.
    // Non-admins cannot set assetType to NFA or NFC (NFA=Hypertek only, NFC=requires license gating by admin).
    if (assetType !== undefined && ["NFA", "NFC", "NFT"].includes(assetType)) {
      if (!callerIsAdmin && (assetType === "NFA" || assetType === "NFC")) {
        return res.status(403).json({
          error: "Only admins can designate items as NFA or NFC.",
        });
      }
      subCollection.assetType = assetType;
      subCollection.isNFA = assetType === "NFA";
    } else if (isNFA !== undefined) {
      // Legacy fallback — block non-admins from setting isNFA=true
      const nfaBool = isNFA === "true" || isNFA === true;
      if (!callerIsAdmin && nfaBool) {
        return res.status(403).json({
          error: "Only admins can designate items as NFA.",
        });
      }
      subCollection.isNFA = nfaBool;
      subCollection.assetType = nfaBool ? "NFA" : (subCollection.assetType || "NFT");
    }

    // Admin-only fields: nfaFrame, minimumBuybackUSD, reservePriceUSD
    if (!callerIsAdmin && (nfaFrame !== undefined || minimumBuybackUSD !== undefined || reservePriceUSD !== undefined)) {
      return res.status(403).json({
        error: "Only admins can set NFA frame, minimum buyback, or reserve price.",
      });
    }

    if (nfaFrame !== undefined) subCollection.nfaFrame = nfaFrame || null;

    // Min BB — enforce max 35% of listing price
    if (minimumBuybackUSD !== undefined && minimumBuybackUSD !== "") {
      const minBB = parseFloat(minimumBuybackUSD);
      const listPrice = parseFloat(priceETH ?? subCollection.priceETH ?? 0);
      const maxAllowed = parseFloat((listPrice * 0.35).toFixed(2));
      if (listPrice > 0 && minBB > maxAllowed) {
        return res.status(400).json({
          error: `Minimum buyback ($${minBB}) exceeds the 35% cap of listing price ($${listPrice}). Maximum allowed: $${maxAllowed}.`,
          maxAllowed,
        });
      }
      subCollection.minimumBuybackUSD = minBB;
    }

    // Reserve price
    if (reservePriceUSD !== undefined && reservePriceUSD !== "")
      subCollection.reservePriceUSD = parseFloat(reservePriceUSD);

    // Artist assignment — admin links an artist to this item for royalty dispatch
    if (artistId !== undefined)
      subCollection.artistId = artistId || null;

    if (req.file) {
      subCollection.image = await saveImagePermanently(req.file.path, req.file.filename);
    } else if (req.body.image) {
      subCollection.image = req.body.image;
    }

    await parent.save();

    return res.json({
      success: true,
      message: "Sub-collection updated successfully",
      subCollection,
    });
  } catch (err) {
    console.error(" UPDATE SUB-COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Delete Sub-Collection
 */
export async function deleteSubCollection(req, res) {
  try {
    const { parentId, subCollectionId } = req.params;

    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    // Grab item details before removal for Trade matching
    const sub = parent.subCollections.id(subCollectionId);
    const itemName = sub?.name || null;
    const ownerWallet = sub?.owner || null;

    // Cascade: cancel all active listings for this item across all channels
    try {
      const { cancelSiblingListings } = await import("../services/cancelSiblingListings.js");
      await cancelSiblingListings(subCollectionId, { itemName, ownerWallet });
      console.log(`🧹 [deleteSubCollection] Cascaded cleanup for subCollection ${subCollectionId}`);
    } catch (cleanupErr) {
      console.error("⚠️ [deleteSubCollection] Cascade cleanup error (non-blocking):", cleanupErr.message);
    }

    parent.subCollections.pull(subCollectionId);
    await parent.save();

    return res.json({
      success: true,
      message: "Sub-collection deleted successfully",
    });
  } catch (err) {
    console.error(" DELETE SUB-COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Mint Sub-Collection NFT
 */
export async function mintSubCollection(req, res) {
  console.log("📥 Mint sub-collection request:", req.body);

  try {
    const { parentId, subCollectionId, tokenURI, royaltyBps, creatorWallet } =
      req.body;

    // Validation
    if (!parentId || !subCollectionId || !tokenURI || !creatorWallet) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: parentId, subCollectionId, tokenURI, or creatorWallet",
      });
    }

    if (!ethers.isAddress(creatorWallet)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    // Find parent collection
    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: "Parent collection not found",
      });
    }

    // Find sub-collection within parent
    const subCollection = parent.subCollections.id(subCollectionId);
    if (!subCollection) {
      return res.status(404).json({
        success: false,
        error: "Sub-collection not found",
      });
    }

    // Edition (maxSupply > 1) vs single item (maxSupply === 1).
    // A single item's template IS the token, so once it has a tokenId it's minted.
    // An edition's template is NEVER a token — each buyer gets a freshly-minted
    // token of their own; the template only tracks how many have been minted.
    const isEdition = (subCollection.maxSupply || 1) > 1;

    if (!isEdition && subCollection.tokenId) {
      return res.status(400).json({
        success: false,
        error: "NFT already minted",
        tokenId: subCollection.tokenId,
      });
    }

    if (isEdition && (subCollection.currentSupply || 0) >= (subCollection.maxSupply || 1)) {
      return res.status(400).json({
        success: false,
        error: "All editions of this item have been sold out",
      });
    }

    // BlockChain Initialization
    const chainId = req.body.chainId || 84532; // Default to Base Sepolia if not provided
    console.log(`🔗 Minting on Chain ID: ${chainId}`);

    const { nftContract, wallet: backendWalletObj, provider } = getBlockchain(chainId);

    if (!nftContract || !provider || !backendWalletObj) {
      return res.status(500).json({
        success: false,
        error: "Blockchain not initialized for this chain",
      });
    }

    // Backend wallet balance check
    const backendWallet = await backendWalletObj.getAddress();
    const balance = await provider.getBalance(backendWallet);

    console.log("💰 Backend wallet:", backendWallet);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      return res.status(500).json({
        success: false,
        error: "Backend wallet has no ETH for gas",
      });
    }

    let tx, receipt, tokenId;

    try {
      // Fetch the latest confirmed nonce to avoid NONCE_EXPIRED errors
      let currentNonce = await provider.getTransactionCount(backendWallet, "latest");
      console.log(`📡 Current Nonce: ${currentNonce}`);

      // Mint NFT on blockchain
      console.log("🎨 Minting NFT...");
      console.log("- TokenURI:", tokenURI);
      console.log("- RoyaltyBps:", royaltyBps || 500);

      tx = await nftContract.mint(creatorWallet, tokenURI, royaltyBps || 500, { nonce: currentNonce });
      console.log("📤 Mint Transaction sent:", tx.hash);

      receipt = await tx.wait();
      console.log("Confirmed in block:", receipt.blockNumber);
      currentNonce++; // Increment nonce for next tx

      // Extract TokenId from events
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            // Check if log is from our contract
            if (log.address.toLowerCase() !== nftContract.target.toLowerCase()) {
              continue;
            }

            const parsed = nftContract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });

            if (!parsed) continue;

            console.log("📝 Log Event:", parsed.name, parsed.args);

            if (parsed.name === "Transfer") {
              // Transfer(from, to, tokenId)
              tokenId = Number(parsed.args[2]);
              console.log("🎯 TokenId found in Transfer:", tokenId);
            } else if (parsed.name === "Minted") {
              // Minted(owner, tokenId, uri, royalty)
              tokenId = Number(parsed.args[1]);
              console.log("🎯 TokenId found in Minted:", tokenId);
            }

            if (tokenId !== undefined) break;
          } catch (e) {
            console.log("⚠️ Log parsing error:", e.message);
          }
        }
      }

      if (tokenId === undefined) {
        throw new Error(" Failed to retrieve Token ID from transaction receipt. Logs did not contain Transfer or Minted event.");
      }

      // Transfer ownership (with L2 node indexing retry loop)
      let owner;
      let retries = 20;
      while (retries > 0) {
        try {
          // If this succeeds, the node has indexed the token!
          owner = await nftContract.ownerOf(tokenId);
          if (owner) {
            console.log(`Node indexed Token #${tokenId}. Owner is ${owner}.`);
            break;
          }
        } catch (err) {
          console.log(`⏳ Node hasn't indexed Token #${tokenId} yet... (${retries - 1} left)`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        }
      }

      if (retries === 0) {
        throw new Error(` Blockchain node failed to index NFT #${tokenId} after 60 seconds.`);
      }

      console.log(`⚠️ Transferring token ${tokenId} from backend to ${creatorWallet}...`);
      const transferTx = await nftContract.transferFrom(
        backendWallet,
        creatorWallet,
        tokenId,
        { nonce: currentNonce }
      );
      await transferTx.wait();
      console.log("NFT transferred to:", creatorWallet);
      currentNonce++;

      // Mark as sold so smart contract treats next sale as secondary
      const markTx = await nftContract.markAsSold(tokenId, { nonce: currentNonce });
      await markTx.wait();
      console.log("Marked as sold on contract (isFirstSale = false)");
    } catch (mintErr) {
      console.error(" Mint error:", mintErr);

      let errorMessage = "Failed to mint NFT";

      if (mintErr.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH in backend wallet";
      } else if (mintErr.reason) {
        errorMessage = mintErr.reason;
      } else if (mintErr.message) {
        errorMessage = mintErr.message;
      }

      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: mintErr.toString(),
      });
    }

    // Update Database - ONLY sub-collection
    const mintPrice = req.body.priceETH || subCollection.priceETH || 0;
    const deployerWallet = (process.env.PLATFORM_WALLET_ADDRESS || "").toLowerCase();
    const buyerWallet = creatorWallet.toLowerCase();

    // Record the mint as a first sale (audit trail).
    const saleRecord = {
      buyer: buyerWallet,
      seller: deployerWallet || "unknown",
      priceETH: String(mintPrice || "0"),
      royaltyPaid: "0",
      platformFee: 0,
      sellerReceived: 0,
      txHash: receipt.hash,
      isFirstSale: true,
      createdAt: new Date(),
    };

    if (isEdition) {
      // Edition: the buyer's token was just minted on-chain to their wallet.
      // The template stays unminted & listed — only its supply counter moves.
      // (Never stamp tokenId/owner here, or the template would falsely appear
      // "On-Chain" and become un-buyable for the next buyer.)
      subCollection.currentSupply = (subCollection.currentSupply || 0) + 1;

      const soldOut = subCollection.currentSupply >= (subCollection.maxSupply || 1);
      if (soldOut) {
        subCollection.listed = false;
        subCollection.priceETH = null;
      }

      // Keep the MarketListing shadow record's quantity in sync.
      MarketListing.findOneAndUpdate(
        { subCollectionId: subCollection._id.toString(), status: "active" },
        {
          $inc: { quantitySold: 1, quantityRemaining: -1 },
          ...(soldOut ? { status: "sold" } : {}),
        },
      ).catch((e) => console.warn("[Edition mint] MarketListing sync error:", e.message));

      // Give the buyer their own owned copy so the purchase shows in their
      // profile. This copy is a unique owned token (maxSupply 1) — it carries
      // the real tokenId, is not listed (won't re-appear in the marketplace),
      // and can later be resold via the standard single-item flow.
      parent.subCollections.push({
        name: subCollection.name,
        symbol: subCollection.symbol,
        image: subCollection.image,
        description: subCollection.description,
        tokenId: tokenId,
        tokenURI: tokenURI,
        owner: buyerWallet,
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
      // Single item: the template IS the token — transfer it to the buyer and delist.
      subCollection.tokenId = tokenId;
      subCollection.tokenURI = tokenURI;
      subCollection.owner = buyerWallet;
      subCollection.listed = false;
      // Mark as sold so the next sale is treated as secondary.
      subCollection.isFirstSale = false;

      if (!subCollection.salesHistory) subCollection.salesHistory = [];
      subCollection.salesHistory.push(saleRecord);
    }

    // Increment parent sales count
    parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;

    // FORCE SAVE
    parent.markModified('subCollections');
    await parent.save();

    console.log("Mint completed!");
    console.log("- TokenId:", tokenId);
    console.log("- Owner:", creatorWallet.toLowerCase());
    console.log("- Sub-collection updated in database");

    return res.json({
      success: true,
      message: "NFT minted successfully",
      tokenId: tokenId,
      owner: creatorWallet.toLowerCase(),
      subCollection: {
        _id: subCollection._id,
        name: subCollection.name,
        symbol: subCollection.symbol,
        tokenId: subCollection.tokenId,
        owner: subCollection.owner,
        listed: subCollection.listed,
        isFirstSale: subCollection.isFirstSale,
      },
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (err) {
    console.error(" SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Unknown error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}

/**
 * Create Collection (store metadata)
 */
export async function createCollection(req, res) {
  try {
    const {
      name,
      symbol,
      Type,
      chain,
      owner,
      royaltyPercent,
      royaltyWallet,
      priceETH,
      supply,
    } = req.body;

    const userRole = req.user?.Role || req.user?.role;
    const isAdmin = userRole?.toLowerCase() === "admin";
    const creatorType = isAdmin ? "admin" : "user";
    const userId = req.user?._id || req.user?.id || null;
    const creatorWallet = owner;

    if (!name || !symbol || !chain || !owner) {
      return res.status(400).json({
        error: "Missing required fields: name, symbol, chain, owner",
      });
    }

    let image;
    if (req.file) {
      image = await saveImagePermanently(req.file.path, req.file.filename);
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({
        error: "Image is required (file or URL).",
      });
    }

    const finalRoyaltyWallet = royaltyWallet || owner;

    const doc = await NFTSystem.create({
      userId: userId,
      priceETH: priceETH || 0.01,
      collection: {
        name,
        symbol,
        Type: Type || "ERC721",
        chain,
        image,
        owner,
        royaltyPercent: royaltyPercent || 5,
        royaltyWallet: finalRoyaltyWallet,
        supply: supply || 1,
        creator: creatorType,
        salesCount: 0,
      },
      creator: creatorWallet,
      owner: creatorWallet,
      status: "active",
      listed: false, // Initially not listed
      isFirstSale: true,
    });

    return res.json({
      success: true,
      message: `Collection created by ${creatorType}`,
      doc,
      createdBy: {
        role: userRole,
        userId: userId,
        type: creatorType,
        isAdmin: isAdmin,
      },
    });
  } catch (err) {
    console.error(" CREATE COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Server-side Mint NFT - COMPLETE VERSION
 */
export async function serverMint(req, res) {
  console.log("📥 Incoming mint request:", req.body);

  try {
    const { docId, tokenURI, royaltyBps, creatorWallet } = req.body;

    if (!docId || !tokenURI || !creatorWallet) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: docId, tokenURI, or creatorWallet",
      });
    }

    if (!ethers.isAddress(creatorWallet)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    const nftDoc = await NFTSystem.findById(docId);
    if (!nftDoc) {
      return res.status(404).json({
        success: false,
        error: "NFT document not found",
      });
    }

    if (nftDoc.tokenId) {
      return res.status(400).json({
        success: false,
        error: "NFT already minted",
        tokenId: nftDoc.tokenId,
      });
    }

    if (!nftContract || !provider) {
      return res.status(500).json({
        success: false,
        error: "Blockchain not initialized",
      });
    }

    const walletAddress = await wallet.getAddress();
    const balance = await provider.getBalance(walletAddress);

    console.log("💰 Backend wallet:", walletAddress);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      return res.status(500).json({
        success: false,
        error: "Backend wallet has no ETH for gas",
      });
    }

    let tx, receipt, tokenId;

    try {
      console.log("🎨 Minting NFT...");
      console.log("- TO Address:", creatorWallet);
      console.log("- TokenURI:", tokenURI);
      console.log("- RoyaltyBps:", royaltyBps || 500);

      // Try to mint
      tx = await nftContract.mint(creatorWallet, tokenURI, royaltyBps || 500);
      console.log("📤 Transaction sent:", tx.hash);

      receipt = await tx.wait();
      console.log("Confirmed in block:", receipt.blockNumber);

      // Extract TokenId from events
      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() !== nftContract.target.toLowerCase()) {
            continue;
          }

          const parsed = nftContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsed.name === "Transfer") {
            tokenId = Number(parsed.args.tokenId || parsed.args[2]);
            if (tokenId !== undefined) {
              console.log("🎯 TokenId from Transfer:", tokenId);
              break;
            }
          }

          if (parsed.name === "Minted") {
            tokenId = Number(parsed.args.tokenId || parsed.args[1]);
            if (tokenId !== undefined) {
              console.log("🎯 TokenId from Minted:", tokenId);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Fallback: nextTokenId
      if (tokenId === undefined) {
        console.log("⚠️ Getting tokenId from nextTokenId...");
        const nextId = await nftContract.nextTokenId();
        tokenId = Number(nextId) - 1;
        console.log("🎯 TokenId:", tokenId);
      }

      if (tokenId === undefined) {
        throw new Error("Could not determine tokenId");
      }

      // Check and transfer ownership if needed
      const owner = await nftContract.ownerOf(tokenId);
      console.log("Current owner:", owner);

      const expectedOwner = creatorWallet.toLowerCase();
      const actualOwner = owner.toLowerCase();

      if (actualOwner !== expectedOwner) {
        console.log("⚠️ Ownership mismatch - transferring...");

        if (actualOwner === walletAddress.toLowerCase()) {
          const transferTx = await nftContract.transferFrom(
            walletAddress,
            creatorWallet,
            tokenId,
          );
          await transferTx.wait();
          console.log("NFT transferred to:", creatorWallet);
        } else {
          throw new Error(`Cannot transfer - owned by: ${actualOwner}`);
        }
      }
    } catch (mintErr) {
      console.error(" Mint error:", mintErr);

      let errorMessage = "Failed to mint NFT";

      if (mintErr.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH in backend wallet";
      } else if (mintErr.reason) {
        errorMessage = mintErr.reason;
      } else if (mintErr.message) {
        errorMessage = mintErr.message;
      }

      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: mintErr.toString(),
      });
    }

    // Update Database
    console.log("💾 Updating database...");
    const updatedNftDoc = await NFTSystem.findByIdAndUpdate(
      docId,
      {
        tokenId,
        tokenURI,
        creator: creatorWallet.toLowerCase(),
        owner: creatorWallet.toLowerCase(),
        listed: false, // Not listed yet
        isFirstSale: true,
      },
      { new: true },
    );

    console.log("Mint completed!");
    console.log("- TokenId:", tokenId);
    console.log("- Owner:", creatorWallet);

    return res.json({
      success: true,
      message: "NFT minted successfully",
      tokenId: tokenId,
      owner: creatorWallet.toLowerCase(),
      nftDoc: updatedNftDoc,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (err) {
    console.error(" SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Unknown error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}

/**
 * Create Listing - Updated to set listed = true
 */
export async function createListing(req, res) {
  try {
    const { nftId, tokenId, seller, priceETH } = req.body;

    if (!nftId || !tokenId || !seller || !priceETH) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const nft = await NFTSystem.findByIdAndUpdate(
      nftId,
      {
        listed: true, // Mark as listed
        priceETH,
        seller: seller.toLowerCase(),
      },
      { new: true },
    );

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    console.log(`NFT ${tokenId} listed for ${priceETH} ETH`);

    return res.json({
      success: true,
      message: "NFT listed successfully",
      nft,
    });
  } catch (err) {
    console.error(" CREATE LISTING ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Record On-chain Sale - COMPLETE VERSION
 */
export async function recordOnchainSale(req, res) {
  try {
    const { tokenId, buyer, seller, priceETH, txHash } = req.body;

    if (!tokenId || !buyer || !seller || !priceETH || !txHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Validate addresses
    if (!ethers.isAddress(buyer) || !ethers.isAddress(seller)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    // Prevent self-purchase
    if (buyer.toLowerCase() === seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Buyer and seller cannot be the same",
      });
    }

    // Validate transaction on blockchain
    if (provider) {
      try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
          return res.status(400).json({
            success: false,
            error: "Transaction not found on blockchain",
          });
        }

        const receipt = await tx.wait();
        if (receipt.status !== 1) {
          return res.status(400).json({
            success: false,
            error: "Transaction failed on blockchain",
          });
        }
      } catch (txErr) {
        console.error("Transaction validation error:", txErr);
        return res.status(400).json({
          success: false,
          error: "Failed to validate transaction",
        });
      }
    }

    const nft = await NFTSystem.findOne({ tokenId: Number(tokenId) });
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: "NFT not found",
      });
    }

    // Validate seller ownership
    if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Seller does not match NFT owner",
      });
    }

    // CRITICAL: Sanitize priceETH — parseFloat to ensure clean number, never scientific notation
    const cleanPrice = parseFloat(String(priceETH));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid priceETH value: ${priceETH}`,
      });
    }

    // Convert to fixed decimal string (max 6 decimal places for USDC)
    const priceUSDC = parseFloat(cleanPrice.toFixed(6));
    console.log(`💰 Processing sale: ${priceUSDC} USDC (received raw: ${priceETH})`);

    const creatorWallet = nft.collection?.royaltyWallet || nft.creator;

    // Calculate payment distribution
    const distribution = calculatePaymentDistribution(
      priceUSDC,
      nft.isFirstSale,
      creatorWallet,
      seller,
    );

    // Record sale
    const saleRecord = {
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      priceETH: priceUSDC,
      royaltyPaid: parseFloat(distribution.creatorAmount.toFixed(6)),
      platformFee: parseFloat(distribution.platformAmount.toFixed(6)),
      sellerReceived: parseFloat(distribution.sellerAmount.toFixed(6)),
      txHash: txHash,
      isFirstSale: nft.isFirstSale,
      createdAt: new Date(),
    };

    nft.salesHistory.push(saleRecord);
    nft.owner = buyer.toLowerCase();
    nft.seller = buyer.toLowerCase();
    nft.buyer = null;
    nft.listed = false; // Remove from listing after sale
    nft.priceETH = 0;
    if (nft.isFirstSale) nft.isFirstSale = false; // Mark as sold
    nft.collection.salesCount = (nft.collection.salesCount || 0) + 1;

    await nft.save();

    console.log(`Sale recorded: Token ${tokenId} sold to ${buyer} for ${priceUSDC} USDC`);

    return res.json({
      success: true,
      message: "Sale recorded successfully",
      nft: {
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        listed: nft.listed,
      },
      sale: saleRecord,
      paymentDistribution: distribution,
    });
  } catch (err) {
    console.error(" RECORD SALE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      details: err.toString(),
    });
  }
}

/**
 * Calculate payment distribution — per Don's brief (all scenarios)
 *
 * Scenario A — NFA, Hypertek first sale:
 *   Bank preset minBB (admin-set), 4% to artist, Hypertek keeps the rest.
 *
 * Scenario B — NFC/NFT, Hypertek first sale:
 *   80% Hypertek (seller), 4% artist, 16% company.
 *   Preset minBB is banked from the seller's 80%.
 *
 * Scenario C — NFC/NFT, Player first sale:
 *   80% player/creator, 10% minBB banked, 10% Hypertek.
 *
 * Scenario D — Resale, all asset types:
 *   80% seller, 4% artist, 5% added to minBB, 11% Hypertek.
 */
function calculatePaymentDistribution(
  priceETH,
  isFirstSale,
  creatorWallet,
  sellerWallet,
  assetType = "NFT",       // "NFA" | "NFC" | "NFT"
  creatorIsAdmin = false,  // true when Hypertek created the item
  presetMinBB = 0,         // admin-set minimumBuybackUSD (used in first-sale scenarios)
) {
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
  const fmt = (n) => parseFloat(n.toFixed(6));

  let sellerAmount, creatorAmount, buybackAmount, companyAmount, platformAmount;

  if (isFirstSale && creatorIsAdmin && assetType === "NFA") {
    // ── Scenario A: NFA — Hypertek first sale ─────────────────────────────────
    creatorAmount = fmt(priceETH * 0.04);
    buybackAmount = fmt(Math.max(0, Math.min(presetMinBB, priceETH - creatorAmount)));
    sellerAmount = fmt(priceETH - creatorAmount - buybackAmount);
    companyAmount = 0;
    platformAmount = fmt(creatorAmount + buybackAmount);

  } else if (isFirstSale && creatorIsAdmin) {
    // ── Scenario B: NFC/NFT — Hypertek first sale ─────────────────────────────
    const sellerGross = fmt(priceETH * 0.80);
    creatorAmount = fmt(priceETH * 0.04);
    companyAmount = fmt(priceETH * 0.16);
    buybackAmount = fmt(Math.min(presetMinBB, sellerGross));
    sellerAmount = fmt(sellerGross - buybackAmount);
    platformAmount = fmt(creatorAmount + companyAmount + buybackAmount);

  } else if (isFirstSale && !creatorIsAdmin) {
    // ── Scenario C: NFC/NFT — Player first sale ───────────────────────────────
    sellerAmount = fmt(priceETH * 0.80);
    creatorAmount = 0;  // creator IS the seller
    buybackAmount = fmt(priceETH * 0.10);
    companyAmount = fmt(priceETH * 0.10);
    platformAmount = fmt(priceETH * 0.20);

  } else {
    // ── Scenario D: Resale — all asset types ──────────────────────────────────
    sellerAmount = fmt(priceETH * 0.80);
    creatorAmount = fmt(priceETH * 0.04);
    buybackAmount = fmt(priceETH * 0.05);
    companyAmount = fmt(priceETH * 0.11);
    platformAmount = fmt(priceETH * 0.20);
  }

  const payments = [
    { recipient: sellerWallet, amount: sellerAmount, percentage: Math.round((sellerAmount / priceETH) * 100), type: "seller_proceeds" },
    { recipient: creatorWallet, amount: creatorAmount, percentage: Math.round((creatorAmount / priceETH) * 100), type: "artist_royalty" },
    { recipient: "buyback_fund", amount: buybackAmount, percentage: Math.round((buybackAmount / priceETH) * 100), type: "buyback_fund" },
    { recipient: platformWallet, amount: companyAmount, percentage: Math.round((companyAmount / priceETH) * 100), type: "company_account" },
  ].filter(p => p.amount > 0);

  return { sellerAmount, creatorAmount, buybackAmount, companyAmount, platformAmount, payments };
}

/**
 * Get Listing Details
 */
export async function getListingDetails(req, res) {
  try {
    const { tokenId } = req.params;

    const nft = await NFTSystem.findOne({ tokenId: Number(tokenId) });
    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    let blockchainListing = null;
    if (marketContract && process.env.MYNFT_ADDRESS) {
      try {
        const listing = await marketContract.getListing(
          process.env.MYNFT_ADDRESS,
          tokenId,
        );
        blockchainListing = {
          seller: listing[0],
          price: formatEther(listing[1]),
          active: listing[2],
        };
      } catch (err) {
        console.error("Error fetching blockchain listing:", err);
      }
    }

    return res.json({
      success: true,
      nft,
      blockchainListing,
    });
  } catch (err) {
    console.error(" GET LISTING ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ... (Keep all other existing functions: getPopularCollections, getRoyaltiesSummary,
// getPlatformRevenue, getNFTById, getNFTsByOwner, getNFTsByCreator, getAllNFTs,
// getAllCollections, updateNFTStatus, getSingleCollection, updateCollection,
// deleteCollection, getTotalCounts)

export async function getPopularCollections(req, res) {
  try {
    const topN = parseInt(req.query.top) || 10;

    const collections = await NFTSystem.find({ status: "active" })
      .sort({ "collection.salesCount": -1 })
      .limit(topN)
      .select("collection tokenId owner listed priceETH createdAt isFirstSale");

    return res.json({
      success: true,
      collections,
      count: collections.length,
    });
  } catch (err) {
    console.error(" GET POPULAR COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getRoyaltiesSummary(req, res) {
  try {
    const { creatorWallet } = req.query;

    let matchStage = {};
    if (creatorWallet) {
      matchStage = {
        $or: [
          { creator: creatorWallet },
          { "collection.owner": creatorWallet },
          { "collection.royaltyWallet": creatorWallet },
        ],
      };
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$salesHistory" },
      {
        $group: {
          _id: "$creator",
          creatorWallet: { $first: "$creator" },
          royaltyWallet: { $first: "$collection.royaltyWallet" },
          totalRoyaltyEarned: { $sum: "$salesHistory.royaltyPaid" },
          totalSalesValue: { $sum: "$salesHistory.priceETH" },
          salesCount: { $sum: 1 },
          firstSaleEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$salesHistory.isFirstSale", true] },
                "$salesHistory.priceETH",
                0,
              ],
            },
          },
          subsequentRoyalties: {
            $sum: {
              $cond: [
                { $eq: ["$salesHistory.isFirstSale", false] },
                "$salesHistory.royaltyPaid",
                0,
              ],
            },
          },
        },
      },
      { $sort: { totalRoyaltyEarned: -1 } },
    ];

    const result = await NFTSystem.aggregate(pipeline);

    return res.json({
      success: true,
      summary: result.map((r) => ({
        ...r,
        totalRoyaltyEarnedETH: r.totalRoyaltyEarned.toFixed(4),
        totalSalesValueETH: r.totalSalesValue.toFixed(4),
        firstSaleEarningsETH: r.firstSaleEarnings.toFixed(4),
        subsequentRoyaltiesETH: r.subsequentRoyalties.toFixed(4),
      })),
    });
  } catch (err) {
    console.error(" GET ROYALTIES ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getPlatformRevenue(req, res) {
  try {
    const pipeline = [
      { $unwind: "$salesHistory" },
      {
        $match: {
          "salesHistory.isFirstSale": false,
        },
      },
      {
        $group: {
          _id: null,
          totalPlatformFees: { $sum: "$salesHistory.platformFee" },
          totalTransactionValue: { $sum: "$salesHistory.priceETH" },
          transactionCount: { $sum: 1 },
          averageTransactionValue: { $avg: "$salesHistory.priceETH" },
        },
      },
    ];

    const result = await NFTSystem.aggregate(pipeline);

    const revenue = result[0] || {
      totalPlatformFees: 0,
      totalTransactionValue: 0,
      transactionCount: 0,
      averageTransactionValue: 0,
    };

    return res.json({
      success: true,
      platformRevenue: {
        ...revenue,
        totalPlatformFeesETH: revenue.totalPlatformFees.toFixed(4),
        totalTransactionValueETH: revenue.totalTransactionValue.toFixed(4),
        averageTransactionValueETH: revenue.averageTransactionValue.toFixed(4),
      },
    });
  } catch (err) {
    console.error(" GET PLATFORM REVENUE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getNFTById(req, res) {
  try {
    const { id } = req.params;
    const nft = await NFTSystem.findById(id);

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    return res.json({ success: true, nft });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getNFTsByOwner(req, res) {
  try {
    const { owner } = req.query;
    if (!owner)
      return res.status(400).json({ error: "Owner address required" });

    const nfts = await NFTSystem.find({
      owner: owner.toLowerCase(),
      status: "active",
    }).sort({ createdAt: -1 });

    return res.json({ success: true, nfts, count: nfts.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getNFTsByCreator(req, res) {
  try {
    const { creator } = req.query;
    if (!creator)
      return res.status(400).json({ error: "Creator address required" });

    const nfts = await NFTSystem.find({
      creator: creator.toLowerCase(),
      status: "active",
    }).sort({ createdAt: -1 });

    return res.json({ success: true, nfts, count: nfts.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getAllNFTs(req, res) {
  try {
    const nfts = await NFTSystem.find();

    return res.json({
      success: true,
      count: nfts.length,
      nfts,
    });
  } catch (err) {
    console.error("getAllNFTs error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getAllCollections(req, res) {
  try {
    const collections = await NFTSystem.find({ status: "active" })
      .select("collection tokenId owner listed priceETH createdAt isFirstSale")
      .sort({ createdAt: -1 });

    return res.json({ success: true, collections, count: collections.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function updateNFTStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const nft = await NFTSystem.findById(id);
    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    nft.status = status;
    await nft.save();

    return res.json({
      success: true,
      message: `NFT status updated to ${status}`,
      nft,
    });
  } catch (err) {
    console.error("updateNFTStatus error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getSingleCollection(req, res) {
  try {
    const { id } = req.params;
    const collection = await NFTSystem.find({ userId: id });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    return res.json({ success: true, collection });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function updateCollection(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      symbol,
      Type,
      chain,
      owner,
      royaltyPercent,
      royaltyWallet,
      status,
      priceETH,
      supply,
      creator,
    } = req.body;

    const existing = await NFTSystem.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Collection not found" });
    }

    let image = existing.collection.image;
    if (req.file) {
      image = await saveImagePermanently(req.file.path, req.file.filename);
    }

    const updated = await NFTSystem.findByIdAndUpdate(
      id,
      {
        priceETH: priceETH ?? existing.priceETH,
        "collection.name": name || existing.collection.name,
        "collection.symbol": symbol || existing.collection.symbol,
        "collection.Type": Type || existing.collection.Type,
        "collection.chain": chain || existing.collection.chain,
        "collection.image": image,
        "collection.owner": owner || existing.collection.owner,
        "collection.royaltyPercent":
          royaltyPercent ?? existing.collection.royaltyPercent,
        "collection.royaltyWallet":
          royaltyWallet || existing.collection.royaltyWallet,
        "collection.creator": creator || existing.collection.creator,
        "collection.supply": supply || existing.collection.supply,
        "collection.status": status || existing.collection.status,
      },
      { new: true },
    );

    return res.json({ success: true, updated });
  } catch (err) {
    console.error("UPDATE COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteCollection(req, res) {
  try {
    const { id } = req.params;

    // Fetch the collection first to cascade-cleanup all sub-items
    const toDelete = await NFTSystem.findById(id);
    if (!toDelete) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Cascade: cancel all active listings for every subCollection in this collection
    if (toDelete.subCollections && toDelete.subCollections.length > 0) {
      try {
        const { cancelSiblingListings } = await import("../services/cancelSiblingListings.js");
        const cleanupPromises = toDelete.subCollections.map((sub) =>
          cancelSiblingListings(String(sub._id), {
            itemName: sub.name,
            ownerWallet: sub.owner,
          })
        );
        await Promise.all(cleanupPromises);
        console.log(`🧹 [deleteCollection] Cascaded cleanup for ${toDelete.subCollections.length} sub-items in collection ${id}`);
      } catch (cleanupErr) {
        console.error("⚠️ [deleteCollection] Cascade cleanup error (non-blocking):", cleanupErr.message);
      }
    }

    await NFTSystem.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getTotalCounts(req, res) {
  try {
    const totalCollections = await NFTSystem.countDocuments({});
    const totalNFTs = await NFTSystem.countDocuments({});

    const nftsWithSales = await NFTSystem.find({}, "salesHistory");
    let totalSalesCount = 0;
    nftsWithSales.forEach((nft) => {
      totalSalesCount += nft.salesHistory.length;
    });

    const totalBuysCount = totalSalesCount;

    return res.json({
      success: true,
      totalCollections,
      totalNFTs,
      totalSalesCount,
      totalBuysCount,
    });
  } catch (err) {
    console.error("getTotalCounts error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function cancelListing(req, res) {
  try {
    const { nftId, tokenId } = req.body;

    if (!nftId || !tokenId) {
      return res.status(400).json({
        error: "Missing required fields: nftId, tokenId",
      });
    }

    const nft = await NFTSystem.findByIdAndUpdate(
      nftId,
      {
        listed: false,
        priceETH: 0,
        seller: null,
      },
      { new: true },
    );

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    console.log(`Listing cancelled for Token #${tokenId}`);

    return res.json({
      success: true,
      message: "Listing cancelled successfully",
      nft,
    });
  } catch (err) {
    console.error(" CANCEL LISTING ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Get NFTs owned by a specific wallet (public or authenticated)
export async function getNFTsByWallet(req, res) {
  try {
    const walletAddress = req.params.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const nfts = await NFTSystem.find({
      owner: walletAddress.toLowerCase(),
      status: "active",
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: nfts.length,
      nfts,
    });
  } catch (err) {
    console.error(" GET NFTs BY WALLET ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Add this new function to your nftController.js

/**
 * Get NFTs owned by wallet - INCLUDING SUB-COLLECTIONS
 * This endpoint returns both regular NFTs and parent collections with their sub-collections
 */
export async function getNFTsWithSubCollections(req, res) {
  try {
    const walletAddress = req.params.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    console.log("🔍 Fetching NFTs for wallet:", walletAddress);

    // Find all parent collections where user owns sub-collections
    const parentCollections = await NFTSystem.find({
      "subCollections.owner": walletAddress.toLowerCase(),
      status: "active",
    }).sort({ createdAt: -1 });

    console.log("📦 Found parent collections:", parentCollections.length);

    // Also find regular NFTs (non-parent collections)
    const regularNFTs = await NFTSystem.find({
      owner: walletAddress.toLowerCase(),
      status: "active",
      $or: [
        { isParentCollection: { $exists: false } },
        { isParentCollection: false },
      ],
    }).sort({ createdAt: -1 });

    console.log("🎨 Found regular NFTs:", regularNFTs.length);

    // ── Lazy cleanup: reset listed=false for subCollections whose MarketListing
    // has expired (TTL-deleted by MongoDB) or been cancelled.
    // This runs in the background so it doesn't slow down the response.
    (async () => {
      try {
        const staleIds = [];
        for (const parent of parentCollections) {
          for (const sub of parent.subCollections) {
            if (sub.listed && sub.owner?.toLowerCase() === walletAddress.toLowerCase()) {
              staleIds.push({ parentId: parent._id, subId: sub._id });
            }
          }
        }
        if (staleIds.length === 0) return;

        // Check which subCollections still have an active MarketListing or active Auction
        const subIdStrings = staleIds.map((s) => String(s.subId));
        const [activeListings, activeAuctions] = await Promise.all([
          MarketListing.find({ subCollectionId: { $in: subIdStrings }, status: "active" }).select("subCollectionId"),
          Auction.find({ subCollectionId: { $in: subIdStrings }, status: "active" }).select("subCollectionId"),
        ]);
        const stillActiveIds = new Set([
          ...activeListings.map((l) => String(l.subCollectionId)),
          ...activeAuctions.map((a) => String(a.subCollectionId)),
        ]);

        // Reset listed=false for any subCollection with no active listing or auction
        const staleByParent = {};
        for (const { parentId, subId } of staleIds) {
          if (!stillActiveIds.has(String(subId))) {
            if (!staleByParent[parentId]) staleByParent[parentId] = [];
            staleByParent[parentId].push(String(subId));
          }
        }

        for (const [parentId, subIds] of Object.entries(staleByParent)) {
          const parent = parentCollections.find((p) => String(p._id) === parentId);
          if (!parent) continue;
          let changed = false;
          for (const subId of subIds) {
            const sub = parent.subCollections.id(subId);
            if (sub && sub.listed) {
              sub.listed = false;
              changed = true;
            }
          }
          if (changed) {
            parent.markModified("subCollections");
            await parent.save();
          }
        }
      } catch (cleanupErr) {
        console.error("getNFTsWithSubCollections lazy cleanup error:", cleanupErr.message);
      }
    })();

    // Combine both
    const allNFTs = [...parentCollections, ...regularNFTs];

    return res.json({
      success: true,
      count: allNFTs.length,
      nfts: allNFTs,
      breakdown: {
        parentCollections: parentCollections.length,
        regularNFTs: regularNFTs.length,
        totalSubCollections: parentCollections.reduce(
          (sum, parent) => sum + (parent.subCollections?.length || 0),
          0,
        ),
      },
    });
  } catch (err) {
    console.error(" GET NFTs WITH SUB-COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Create Listing for Sub-Collection
 */
/**
 * Create Listing for Sub-Collection - SMART VERSION
 */
export async function createSubCollectionListing(req, res) {
  try {
    const { parentId, subCollectionId, tokenId, seller, priceETH } = req.body;

    console.log("📥 Listing request:", {
      parentId,
      subCollectionId,
      tokenId,
      seller,
      priceETH,
    });

    if (!seller || !priceETH) {
      return res.status(400).json({
        error: "Missing required fields: seller, priceETH",
      });
    }
    if (!tokenId && !subCollectionId && !parentId) {
      return res.status(400).json({
        error: "Must provide tokenId, subCollectionId, or parentId to identify the item",
      });
    }

    let parent;

    // Option 1: If parentId is provided
    if (parentId && subCollectionId) {
      parent = await NFTSystem.findById(parentId);
      if (!parent) {
        return res.status(404).json({ error: "Parent collection not found" });
      }
    }
    // Option 2: Find parent by sub-collection ID
    else if (subCollectionId) {
      parent = await NFTSystem.findOne({
        "subCollections._id": subCollectionId,
      });
      if (!parent) {
        return res.status(404).json({
          error: "Parent collection not found for this sub-collection",
        });
      }
    }
    // Option 3: Find by tokenId
    else if (tokenId) {
      parent = await NFTSystem.findOne({
        "subCollections.tokenId": tokenId,
      });
      if (!parent) {
        return res.status(404).json({
          error: "Parent collection not found for this token",
        });
      }
    } else {
      return res.status(400).json({
        error: "Must provide parentId, subCollectionId, or tokenId",
      });
    }

    console.log("Found parent:", parent._id);

    // Find sub-collection
    const subCollection = subCollectionId
      ? parent.subCollections.id(subCollectionId)
      : parent.subCollections.find((sub) => sub.tokenId === tokenId);

    if (!subCollection) {
      return res.status(404).json({ error: "Sub-collection not found" });
    }

    console.log("Found sub-collection:", subCollection._id);

    // Verify ownership — skip if sub has no owner set (platform first-sale item)
    if (subCollection.owner && subCollection.owner !== "admin") {
      if (subCollection.owner.toLowerCase() !== seller.toLowerCase()) {
        return res.status(403).json({
          error: "You don't own this sub-collection",
          currentOwner: subCollection.owner,
          providedSeller: seller,
        });
      }
    }

    // Validate minimum buyback reserve for NFA items
    if (subCollection.isNFA && subCollection.minimumBuybackUSD > 0 && parseFloat(priceETH) < subCollection.minimumBuybackUSD) {
      return res.status(400).json({
        error: `Price $${priceETH} is below the minimum buyback reserve of $${subCollection.minimumBuybackUSD}`,
        code: "BELOW_RESERVE",
        minimumBuybackUSD: subCollection.minimumBuybackUSD,
      });
    }

    // Update sub-collection listing status
    subCollection.listed = true;
    subCollection.priceETH = priceETH;

    parent.markModified('subCollections');
    await parent.save();

    // Sync to MarketListing for profile Listings tab
    const CAT_ALIAS = {
      "military badges and collectables": "military badges",
      "vehicles": "racing vehicles",
      "land/bases": "land and bases",
    };
    const VALID_CATS = ["skins", "military badges", "specialists", "weapons", "body armour", "spaceships", "racing vehicles", "artwork", "land and bases", "general"];
    const rawCat = (parent.category || parent.collection?.name || "general").toLowerCase().trim();
    const normCat = CAT_ALIAS[rawCat] || (VALID_CATS.includes(rawCat) ? rawCat : "general");

    // Remove any existing active listing for this sub-collection then create fresh
    const itemMaxSupply = subCollection.maxSupply || 1;
    await MarketListing.deleteOne({ subCollectionId: subCollection._id.toString(), status: "active" });
    await MarketListing.create({
      userId: req.user._id || req.user.id,
      userName: req.user.FullName || req.user.Name || req.user.Email?.split("@")[0] || "Anonymous",
      userWallet: seller,
      category: normCat,
      activityType: "selling_general",
      itemName: subCollection.name || "Unnamed",
      itemDescription: subCollection.description || "",
      itemImage: subCollection.image || "",
      assetType: subCollection.assetType || (subCollection.isNFA ? "NFA" : "NFT"),
      isNFA: subCollection.isNFA || false,
      nftSystemId: parent._id,
      subCollectionId: subCollection._id.toString(),
      price: Number(priceETH),
      maxSupply: itemMaxSupply,
      quantitySold: 0,
      quantityRemaining: itemMaxSupply,
      status: "active",
    });

    console.log(`Sub-collection ${subCollection._id} listed for ${priceETH} USDC`);

    return res.json({
      success: true,
      message: "Sub-collection listed successfully",
      subCollection,
      parentId: parent._id,
    });
  } catch (err) {
    console.error(" CREATE SUB-COLLECTION LISTING ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function recordSubCollectionSale(req, res) {
  try {
    const {
      tokenId,
      buyer,
      seller,
      priceETH,
      txHash,
      parentId,
      subCollectionId,
      offerId,
    } = req.body;

    console.log("💰 Recording Sub-Collection Sale:", {
      tokenId,
      buyer,
      seller,
      priceETH,
      txHash,
      parentId,
      subCollectionId,
    });

    if (!buyer || !seller || !priceETH || !txHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: buyer, seller, priceETH, txHash",
      });
    }
    if (!tokenId && !subCollectionId && !parentId) {
      return res.status(400).json({
        success: false,
        error: "Must provide tokenId, subCollectionId, or parentId",
      });
    }

    // Validate addresses
    if (!ethers.isAddress(buyer) || !ethers.isAddress(seller)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    // Prevent self-purchase
    if (buyer.toLowerCase() === seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Buyer and seller cannot be the same",
      });
    }

    // Validate transaction on blockchain
    // Validate transaction on blockchain
    // Default to Base Sepolia if no chainId provided
    const chainId = req.body.chainId || 84532;
    const { provider } = getBlockchain(chainId);

    if (provider) {
      try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
          return res.status(400).json({
            success: false,
            error: "Transaction not found on blockchain",
          });
        }

        // We could wait for receipt here, but usually frontend sends this after confirmation
        // const receipt = await tx.wait(); 
      } catch (txErr) {
        console.error("Transaction validation error:", txErr);
      }
    } else {
      console.warn("⚠️ No provider available for transaction validation");
    }

    // Find parent collection
    let parent;
    if (parentId) {
      parent = await NFTSystem.findById(parentId);
    } else {
      parent = await NFTSystem.findOne({
        "subCollections.tokenId": Number(tokenId),
      });
    }

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: "Parent collection not found",
      });
    }

    // Find sub-collection
    const subCollection = subCollectionId
      ? parent.subCollections.id(subCollectionId)
      : parent.subCollections.find((sub) => sub.tokenId === Number(tokenId));

    if (!subCollection) {
      return res.status(404).json({
        success: false,
        error: "Sub-collection not found",
      });
    }

    // Validate seller ownership
    // If owner is undefined/null/"admin", it's a first-sale platform item — allow any valid seller
    const currentOwner = subCollection.owner;
    if (currentOwner && currentOwner !== "admin" && currentOwner.toLowerCase() !== seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Seller does not match sub-collection owner",
        expectedSeller: currentOwner,
        providedSeller: seller,
      });
    }

    const creatorWallet =
      parent.collection?.royaltyWallet || parent.collection?.owner;

    // Sanitize priceETH to prevent scientific notation in DB (e.g. 2e-10 → 200)
    const cleanPrice = parseFloat(String(priceETH));
    const priceUSDC = isNaN(cleanPrice) ? 0 : parseFloat(cleanPrice.toFixed(6));
    console.log(`💰 Sub-collection sale: ${priceUSDC} USDC (raw received: ${priceETH})`);

    // ── Fix 5: Reserve price enforcement (on-chain path) ─────────────────────
    const currentMinBB = subCollection.minimumBuybackUSD || 0;
    if (currentMinBB > 0 && priceUSDC < currentMinBB) {
      return res.status(400).json({
        success: false,
        error: `Sale price $${priceUSDC} is below the minimum buyback guarantee of $${currentMinBB}. List at or above the minimum buyback price.`,
        minimumBuybackUSD: currentMinBB,
      });
    }

    // ── Determine sale scenario params ────────────────────────────────────────
    const itemAssetType = subCollection.assetType || (subCollection.isNFA ? "NFA" : "NFT");
    const wasFirstSale = subCollection.isFirstSale !== false; // default true for new items
    const creatorIsAdmin = parent.collection?.creator === "admin";
    const presetMinBB = subCollection.minimumBuybackUSD || 0;

    // ── Calculate payment distribution (per Don's brief — all scenarios) ─────
    const distribution = calculatePaymentDistribution(
      priceUSDC,
      wasFirstSale,
      creatorWallet,
      seller,
      itemAssetType,
      creatorIsAdmin,
      presetMinBB,
    );

    // Create sale record
    const saleRecord = {
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      priceETH: priceUSDC,
      royaltyPaid: parseFloat(distribution.creatorAmount.toFixed(6)),
      platformFee: parseFloat(distribution.platformAmount.toFixed(6)),
      sellerReceived: parseFloat(distribution.sellerAmount.toFixed(6)),
      txHash: txHash,
      isFirstSale: wasFirstSale,
      createdAt: new Date(),
    };

    console.log("📝 Adding Sale Record:", saleRecord);

    // Update sub-collection
    if (!subCollection.salesHistory) {
      subCollection.salesHistory = [];
    }

    const isEdition = (subCollection.maxSupply || 1) > 1;

    subCollection.salesHistory.push(saleRecord);

    if (isEdition) {
      // Edition mode — template stays listed; each purchase mints a fresh token to the buyer.
      // currentSupply tracks how many have been minted so far.
      subCollection.currentSupply = (subCollection.currentSupply || 0) + 1;

      // Decrement the MarketListing quantity counter (non-blocking, fire-and-forget)
      MarketListing.findOneAndUpdate(
        { subCollectionId: subCollection._id.toString(), status: "active" },
        { $inc: { quantitySold: 1, quantityRemaining: -1 } },
        { new: true },
      ).then((updatedListing) => {
        if (updatedListing && updatedListing.quantityRemaining <= 0) {
          // All editions sold — close the listing
          subCollection.listed = false;
          subCollection.priceETH = null;
          parent.markModified("subCollections");
          parent.save().catch((e) => console.warn("⚠️ [Edition] auto-close save error:", e.message));
          MarketListing.findByIdAndUpdate(updatedListing._id, { status: "sold" }).catch((e) =>
            console.warn("⚠️ [Edition] listing status update error:", e.message)
          );
          console.log(`✅ [Edition] All ${subCollection.maxSupply} editions sold — listing closed`);
        }
      }).catch((e) => console.warn("⚠️ [Edition] quantity update error:", e.message));
    } else {
      // Standard single-item mode — transfer ownership and delist
      subCollection.owner = buyer.toLowerCase();
      subCollection.seller = null;
      subCollection.buyer = null;
      subCollection.listed = false;
      subCollection.priceETH = null;
    }

    if (subCollection.isFirstSale) {
      subCollection.isFirstSale = false;
    }

    // ── Fix 4+2: MinBB update (all types) + buyback auto-trigger ─────────────
    if (priceUSDC > 0) {
      if (wasFirstSale && !creatorIsAdmin) {
        // Player first sale — set initial minBB = 10% of sale price
        subCollection.minimumBuybackUSD = parseFloat((priceUSDC * 0.10).toFixed(2));
        console.log(`🏦 [Buyback] ${itemAssetType} player first sale — minBB set to $${subCollection.minimumBuybackUSD}`);
      } else if (!wasFirstSale) {
        // Resale (NFA, NFC, NFT) — add 5% of sale price to existing minBB
        subCollection.minimumBuybackUSD = parseFloat(
          ((subCollection.minimumBuybackUSD || 0) + priceUSDC * 0.05).toFixed(2)
        );
        console.log(`🏦 [Buyback] ${itemAssetType} resale — minBB updated to $${subCollection.minimumBuybackUSD}`);
      }
      // Admin first sale: minBB already preset by admin — no auto-increment

      // Fix 2: Auto-flag buybackPending if sale price slips below minBB (safety net)
      if (subCollection.minimumBuybackUSD > 0 && priceUSDC < subCollection.minimumBuybackUSD) {
        subCollection.buybackPending = true;
        console.warn(`⚠️ [Buyback] Sale $${priceUSDC} < minBB $${subCollection.minimumBuybackUSD} — buybackPending flagged`);
      }
    }

    // Update parent collection sales count
    parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;

    // FORCE SAVE with extra logging
    console.log("💾 Saving Parent Collection...");
    parent.markModified('subCollections');

    const savedParent = await parent.save();

    // Verify save
    const savedSub = savedParent.subCollections.id(subCollection._id);
    console.log("Saved Sub-Collection Sales History Length:", savedSub?.salesHistory?.length);
    console.log("Saved Sub-Collection Owner:", savedSub?.owner);
    console.log("Saved Sub-Collection Listed:", savedSub?.listed);

    console.log(
      `Sub-collection sale recorded: Token ${tokenId} sold to ${buyer}`,
    );

    // Dispatch artist royalty (4%) — non-blocking
    if (distribution.creatorAmount > 0 && creatorWallet && creatorWallet !== "admin") {
      dispatchRoyalty({
        subCollectionId: subCollection._id.toString(),
        parentId: parent._id.toString(),
        artistId: subCollection.artistId,
        creatorWallet,
        amount: distribution.creatorAmount,
        payoutType: "artist_royalty",
        note: `${itemAssetType} artist royalty 4%`,
      }).catch(err => console.warn("⚠️ [RoyaltyService] dispatch error:", err.message));
    }

    // Dispatch buyback fund (5%) — non-blocking
    if (distribution.buybackAmount > 0) {
      const buybackWallet = process.env.BUYBACK_WALLET_ADDRESS;
      if (buybackWallet) {
        dispatchRoyalty({
          subCollectionId: subCollection._id.toString(),
          parentId: parent._id.toString(),
          creatorWallet: buybackWallet,
          amount: distribution.buybackAmount,
          payoutType: "buyback_fund",
          note: `${itemAssetType} buyback fund 5%`,
        }).catch(err => console.warn("⚠️ [BuybackService] dispatch error:", err.message));
      }
    }

    // Dispatch company fee (11%) — non-blocking
    if (distribution.companyAmount > 0) {
      const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
      if (platformWallet) {
        dispatchRoyalty({
          subCollectionId: subCollection._id.toString(),
          parentId: parent._id.toString(),
          creatorWallet: platformWallet,
          amount: distribution.companyAmount,
          payoutType: "company_fee",
          note: `${itemAssetType} company fee 11%`,
        }).catch(err => console.warn("⚠️ [PlatformFee] dispatch error:", err.message));
      }
    }

    // Mark linked offer as completed (USDC on-chain purchase path)
    if (offerId) {
      markOfferCompleted(offerId).catch(err =>
        console.warn("⚠️ [Offer] markOfferCompleted error:", err.message)
      );
    }

    // Write to Activity log (non-blocking)
    Activity.create({
      name: subCollection.name || parent.name || "NFT",
      image: subCollection.image || null,
      type: "Sale",
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      price: priceUSDC,
      time: new Date(),
      itemType: "NFA",
      itemId: parent._id,
    }).catch(err => console.warn("⚠️ [Activity] create error:", err.message));

    return res.json({
      success: true,
      message: "Sub-collection sale recorded successfully",
      subCollection: {
        tokenId: subCollection.tokenId,
        owner: subCollection.owner,
        listed: subCollection.listed,
        isFirstSale: subCollection.isFirstSale,
      },
      sale: saleRecord,
      paymentDistribution: distribution,
      parentId: parent._id,
    });
  } catch (err) {
    console.error(" RECORD SUB-COLLECTION SALE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function cancelSubCollectionListing(req, res) {
  try {
    const { nftId, tokenId, subId } = req.body;

    console.log("🚀 CANCEL SUB-COLLECTION LISTING REQUEST:", {
      nftId,
      tokenId,
      subId,
      time: new Date().toISOString(),
    });

    // 1. Validate required fields
    if (!nftId || (!tokenId && !subId)) {
      return res.status(400).json({
        success: false,
        error: "nftId and either tokenId or subId are required",
      });
    }

    // 2. Find parent collection
    const parent = await NFTSystem.findById(nftId);
    if (!parent) {
      console.error(" Parent collection not found with ID:", nftId);
      return res.status(404).json({
        success: false,
        error: "Parent collection not found",
      });
    }

    console.log("Found parent:", {
      id: parent._id,
      name: parent.collection?.name,
      subCollectionsCount: parent.subCollections?.length || 0,
    });

    // 3. Find sub-collection by subId first, then tokenId as fallback
    let subCollection;
    if (subId) {
      subCollection = parent.subCollections.id(subId);
      console.log("🔍 Looking for sub-collection with subId:", subId);
    }
    if (!subCollection && tokenId != null) {
      const tokenIdNum = parseInt(tokenId);
      if (!isNaN(tokenIdNum)) {
        subCollection = parent.subCollections.find((sub) => sub.tokenId === tokenIdNum);
        console.log("🔍 Looking for sub-collection with tokenId:", tokenIdNum);
      }
    }

    if (!subCollection) {
      console.error(" Sub-collection not found. subId:", subId, "tokenId:", tokenId);
      return res.status(404).json({
        success: false,
        error: `Sub-collection not found`,
      });
    }

    console.log("Found sub-collection:", {
      _id: subCollection._id,
      tokenId: subCollection.tokenId,
      listed: subCollection.listed,
      priceETH: subCollection.priceETH,
      owner: subCollection.owner,
    });

    // 5. Update sub-collection listing status
    subCollection.listed = false;
    subCollection.priceETH = null;
    subCollection.seller = null;

    // 6. Save changes
    parent.markModified('subCollections');
    await parent.save();

    // Remove all MarketListing records for this sub-collection (selling, auction-sync, trade-sync)
    const subIdStr = subCollection._id.toString();
    await MarketListing.deleteMany({
      $or: [
        { subCollectionId: subIdStr },
        { userId: req.user._id || req.user.id, activityType: "trading", itemName: subCollection.name },
      ],
    });

    // Cancel any active Auction for this sub-collection
    const auctionResult = await Auction.updateMany(
      { subCollectionId: subIdStr, status: "active" },
      { status: "cancelled" }
    );

    // Cancel any open/accepted Trade listings for this item (case-insensitive name match; wallet optional)
    const sellerWallet = req.body.seller || subCollection.owner || "";
    const escapedName = subCollection.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tradeFilter = {
      offering: new RegExp(`^${escapedName}$`, "i"),
      status: { $in: ["open", "accepted"] },
    };
    if (sellerWallet) tradeFilter.posterWallet = new RegExp(`^${sellerWallet}$`, "i");
    const tradeResult = await Trade.updateMany(tradeFilter, { status: "cancelled" });

    const cancelledVenues = [];
    if (auctionResult.modifiedCount > 0) cancelledVenues.push(`${auctionResult.modifiedCount} auction(s)`);
    if (tradeResult.modifiedCount > 0) cancelledVenues.push(`${tradeResult.modifiedCount} trade(s)`);
    if (cancelledVenues.length > 0) {
      console.log(`🚫 [Unlist cascade] Also cancelled: ${cancelledVenues.join(", ")} for subCollection ${subCollection._id}`);
    }

    console.log("Successfully cancelled listing:", {
      subId: subCollection._id,
      tokenId: subCollection.tokenId,
      newListed: false,
      cascadeCancelled: cancelledVenues,
    });

    return res.json({
      success: true,
      message: "Listing cancelled successfully",
      parentId: nftId,
      subId: subCollection._id,
      tokenId: subCollection.tokenId,
      cancelledVenues,
    });
  } catch (err) {
    console.error(" CANCEL SUB-COLLECTION LISTING ERROR:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      time: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}

/**
 * Get ONLY owned sub-collections (not entire parent)
 */
export async function getOwnedSubCollectionsOnly(req, res) {
  try {
    const walletAddress = req.params.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const walletLower = walletAddress.toLowerCase();

    // Find parent collections with owned sub-collections
    const parents = await NFTSystem.find({
      "subCollections.owner": walletLower,
      status: "active",
      isParentCollection: true,
    }).select("collection.name collection.image category");

    // Extract only owned sub-collections
    const ownedSubCollections = [];

    parents.forEach((parent) => {
      parent.subCollections.forEach((sub) => {
        if (sub.owner && sub.owner.toLowerCase() === walletLower) {
          ownedSubCollections.push({
            ...sub.toObject(),
            parentInfo: {
              parentId: parent._id,
              parentName: parent.collection.name,
              parentImage: parent.collection.image,
              category: parent.category,
            },
          });
        }
      });
    });

    return res.json({
      success: true,
      ownedSubCollections,
      count: ownedSubCollections.length,
      breakdown: {
        uniqueParents: parents.length,
        totalSubCollections: ownedSubCollections.length,
      },
    });
  } catch (err) {
    console.error(" GET OWNED SUB-COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// controllers/nftController.js میں شامل کریں

export async function getListedSubCollections(req, res) {
  try {
    const walletAddress = req.params.walletAddress;

    console.log("📋 Getting listed sub-collections for:", walletAddress);

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const walletLower = walletAddress.toLowerCase();

    // Find parent collections with LISTED sub-collections owned by this wallet
    // NOTE: do NOT filter on isParentCollection — some collections may have it false/unset
    // but still have valid sub-collections. JS filter below is the authoritative check.
    const parents = await NFTSystem.find({
      subCollections: {
        $elemMatch: { owner: walletLower, listed: true },
      },
      status: "active",
    }).select("collection.name collection.image category subCollections isParentCollection");

    console.log("Found parent collections:", parents.length);

    // Extract only LISTED sub-collections owned by this wallet
    const listedSubCollections = [];

    parents.forEach((parent) => {
      const listedSubs = parent.subCollections.filter(
        (sub) =>
          sub.owner &&
          sub.owner.toLowerCase() === walletLower &&
          sub.listed === true,
      );

      console.log(`   Parent ${parent._id}: ${listedSubs.length} listed subs`);

      listedSubs.forEach((sub) => {
        listedSubCollections.push({
          subId: sub._id,
          name: sub.name,
          symbol: sub.symbol,
          image: sub.image,
          description: sub.description,
          owner: sub.owner,
          listed: sub.listed,
          priceETH: sub.priceETH,
          priceUSD: sub.priceUSD,
          tokenId: sub.tokenId,
          tokenURI: sub.tokenURI,
          createdAt: sub.createdAt,
          parentInfo: {
            parentId: parent._id, // CRITICAL - parent ID for cancel listing
            parentName: parent.collection?.name,
            parentImage: parent.collection?.image,
            category: parent.category,
          },
        });
      });
    });

    console.log(
      "Total listed sub-collections:",
      listedSubCollections.length,
    );

    return res.json({
      success: true,
      listedSubCollections,
      count: listedSubCollections.length,
      breakdown: {
        uniqueParents: parents.length,
        totalListed: listedSubCollections.length,
      },
    });
  } catch (err) {
    console.error(" GET LISTED SUB-COLLECTIONS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}



// In nftController.js, add this function:

/**
 * Get Dashboard Statistics with Chart Data
 * Total Buy = Minted NFTs (regular + sub-collections)
 * Total Sell = Listed NFTs (regular + sub-collections)
 */
export async function getDashboardStats(req, res) {
  try {
    console.log("📊 Fetching Dashboard Stats...");

    // ==================== TOTAL USERS ====================
    let totalUsers = 0;
    let usersData = [];

    // If you have User model, uncomment:
    // try {
    //   totalUsers = await User.countDocuments({});
    //   usersData = await User.find({}).select('createdAt');
    // } catch (err) {
    //   console.log("⚠️ User model not available");
    // }

    // ==================== TOTAL BUY (Minted NFTs) ====================

    // 1. Regular NFTs (non-parent collections with tokenId)
    const regularMintedNFTs = await NFTSystem.find({
      tokenId: { $exists: true, $ne: null },
      $or: [
        { isParentCollection: { $exists: false } },
        { isParentCollection: false }
      ]
    }).select('createdAt tokenId');

    console.log("Regular Minted NFTs:", regularMintedNFTs.length);

    // 2. Sub-collections with tokenId (minted)
    const parentsWithMintedSubs = await NFTSystem.aggregate([
      { $match: { isParentCollection: true } },
      { $unwind: "$subCollections" },
      {
        $match: {
          "subCollections.tokenId": { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          createdAt: "$subCollections.createdAt",
          tokenId: "$subCollections.tokenId"
        }
      }
    ]);

    console.log("Minted Sub-Collections:", parentsWithMintedSubs.length);

    // Combine both for Total Buy
    const totalBuyCount = regularMintedNFTs.length + parentsWithMintedSubs.length;
    const buyData = [
      ...regularMintedNFTs.map(nft => ({ createdAt: nft.createdAt })),
      ...parentsWithMintedSubs.map(sub => ({ createdAt: sub.createdAt }))
    ];

    console.log("💰 Total Buy Count:", totalBuyCount);

    // ==================== TOTAL SELL (Listed NFTs) ====================

    // 1. Regular NFTs that are listed
    const regularListedNFTs = await NFTSystem.find({
      listed: true,
      tokenId: { $exists: true, $ne: null },
      $or: [
        { isParentCollection: { $exists: false } },
        { isParentCollection: false }
      ]
    }).select('createdAt tokenId priceETH');

    console.log("Regular Listed NFTs:", regularListedNFTs.length);

    // 2. Sub-collections that are listed
    const parentsWithListedSubs = await NFTSystem.aggregate([
      { $match: { isParentCollection: true } },
      { $unwind: "$subCollections" },
      {
        $match: {
          "subCollections.listed": true,
          "subCollections.tokenId": { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          createdAt: "$subCollections.createdAt",
          tokenId: "$subCollections.tokenId",
          priceETH: "$subCollections.priceETH"
        }
      }
    ]);

    console.log("Listed Sub-Collections:", parentsWithListedSubs.length);

    // Combine both for Total Sell
    const totalSellCount = regularListedNFTs.length + parentsWithListedSubs.length;
    const sellData = [
      ...regularListedNFTs.map(nft => ({ createdAt: nft.createdAt })),
      ...parentsWithListedSubs.map(sub => ({ createdAt: sub.createdAt }))
    ];

    console.log("📈 Total Sell Count:", totalSellCount);

    // ==================== TOTAL NFAs (Same as Total Buy) ====================
    const totalNFACount = totalBuyCount;
    const nfaData = buyData;

    // ==================== TOTAL COLLECTIONS (Parent Collections only) ====================
    const collections = await NFTSystem.find({
      isParentCollection: true,
      status: "active"
    }).select('createdAt collection.name');

    const totalCollectionCount = collections.length;
    const collectionData = collections.map(col => ({ createdAt: col.createdAt }));

    console.log("📦 Total Collections:", totalCollectionCount);

    // ==================== TOTAL OFFERS ====================
    // Placeholder - implement based on your Offer model
    const totalOfferCount = 0;
    const offerData = [];

    // ==================== FINAL RESPONSE ====================
    console.log("Dashboard Stats Compiled Successfully");
    console.log("Summary:", {
      totalUsers,
      totalBuy: totalBuyCount,
      totalSell: totalSellCount,
      totalNFAs: totalNFACount,
      totalCollections: totalCollectionCount,
      totalOffers: totalOfferCount
    });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalBuy: totalBuyCount,
        totalSell: totalSellCount,
        totalNFAs: totalNFACount,
        totalCollections: totalCollectionCount,
        totalOffers: totalOfferCount
      },
      chartData: {
        users: usersData,
        buy: buyData,
        sell: sellData,
        nfas: nfaData,
        collections: collectionData,
        offers: offerData
      }
    });

  } catch (err) {
    console.error(" GET DASHBOARD STATS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * User NFC Upload
 * POST /api/v1/nft/user-upload
 * Allows a logged-in user to upload an NFC into an existing parent collection (category).
 * No blockchain mint — no royalty rules. No in-game bonus without license (Phase 3).
 */
export async function userUploadNFC(req, res) {
  try {
    const { parentId, name, description, priceETH, speciesId, itemType } = req.body;
    const userId = req.user?._id || req.user?.id;
    const walletAddress = req.user?.WalletAddress;

    if (!parentId || !name) {
      return res.status(400).json({ success: false, error: "parentId and name are required" });
    }
    if (!speciesId || !itemType) {
      return res.status(400).json({
        success: false,
        error: "speciesId and itemType are required to create an NFC. Purchase a license first.",
      });
    }

    // ── Fix 8: Enforce NFC license check ─────────────────────────────────────
    const license = await License.findOne({
      userId,
      speciesId: Number(speciesId),
      itemType: itemType.toLowerCase(),
    });

    if (!license) {
      return res.status(403).json({
        success: false,
        error: `No license found for species ${speciesId} / item type "${itemType}". Purchase a license to create NFC items.`,
        requiredLicense: { speciesId: Number(speciesId), itemType: itemType.toLowerCase() },
      });
    }

    const parent = await NFTSystem.findById(parentId);
    if (!parent || !parent.isParentCollection) {
      return res.status(404).json({ success: false, error: "Parent collection not found" });
    }

    let image;
    if (req.file) {
      image = await saveImagePermanently(req.file.path, req.file.filename);
    } else if (req.body.image) {
      image = req.body.image;
    }

    const subCollection = {
      name,
      description: description || "",
      image: image || "",
      owner: walletAddress || "",
      assetType: "NFC",
      listed: false,
      priceETH: priceETH ? parseFloat(priceETH) : 0,
      isFirstSale: true,
      salesHistory: [],
    };

    parent.subCollections.push(subCollection);
    await parent.save();

    const added = parent.subCollections[parent.subCollections.length - 1];

    console.log(`User NFC uploaded: ${name} into collection ${parent.collection.name} by ${walletAddress || userId}`);

    return res.status(201).json({
      success: true,
      message: "NFC uploaded successfully. It will be visible in the collection. No in-game bonus until license is assigned.",
      data: {
        parentId: parent._id,
        category: parent.category,
        subCollectionId: added._id,
        name: added.name,
        image: added.image,
      },
    });
  } catch (err) {
    console.error(" USER UPLOAD NFC ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
/**
 * Get Transaction History for a wallet
 * Aggregates salesHistory entries where buyer or seller === walletAddress
 */
export async function getUserTransactions(req, res) {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "walletAddress is required" });
    }
    const walletLower = walletAddress.toLowerCase();

    // Find all parent collections that have sub-collections with matching salesHistory
    const parents = await NFTSystem.find({
      isParentCollection: true,
      $or: [
        { "subCollections.salesHistory.buyer": walletLower },
        { "subCollections.salesHistory.seller": walletLower },
      ],
    }).select("collection.name category subCollections.name subCollections.salesHistory");

    const transactions = [];
    parents.forEach((parent) => {
      parent.subCollections.forEach((sub) => {
        if (!sub.salesHistory?.length) return;
        sub.salesHistory.forEach((sale) => {
          const buyerLow = (sale.buyer || "").toLowerCase();
          const sellerLow = (sale.seller || "").toLowerCase();
          if (buyerLow !== walletLower && sellerLow !== walletLower) return;
          transactions.push({
            txHash: sale.txHash || null,
            itemName: sub.name,
            collectionName: parent.collection?.name || "",
            category: parent.category || "",
            priceETH: sale.priceETH,
            buyer: sale.buyer,
            seller: sale.seller,
            type: buyerLow === walletLower ? "buy" : "sell",
            royaltyPaid: sale.royaltyPaid,
            sellerReceived: sale.sellerReceived,
            createdAt: sale.createdAt,
          });
        });
      });
    });

    // Sort newest first
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, transactions, count: transactions.length });
  } catch (err) {
    console.error(" GET USER TRANSACTIONS ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get price history for a specific sub-collection NFT
 * Returns its salesHistory array sorted oldest → newest (for charting)
 */
export async function getSubCollectionById(req, res) {
  try {
    const { subId } = req.params;
    if (!subId) return res.status(400).json({ success: false, error: "subId is required" });

    const parent = await NFTSystem.findOne(
      { "subCollections._id": subId },
      { "subCollections.$": 1, name: 1, symbol: 1, chain: 1, category: 1 }
    );

    if (!parent || !parent.subCollections?.length) {
      return res.status(404).json({ success: false, error: "NFT not found" });
    }

    const sub = parent.subCollections[0].toObject();
    // Inject parentId so Buy1.jsx can resolve it
    sub.parentId = parent._id;

    return res.json({ success: true, item: sub, parentId: parent._id });
  } catch (err) {
    console.error(" GET SUB-COLLECTION BY ID ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSubCollectionPriceHistory(req, res) {
  try {
    const { subId } = req.params;
    if (!subId) {
      return res.status(400).json({ success: false, error: "subId is required" });
    }

    const parent = await NFTSystem.findOne(
      { "subCollections._id": subId },
      { "subCollections.$": 1 }
    );

    if (!parent || !parent.subCollections?.length) {
      return res.status(404).json({ success: false, error: "NFT not found" });
    }

    const sub = parent.subCollections[0];
    const history = (sub.salesHistory || [])
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((s) => ({
        price: s.priceETH,
        buyer: s.buyer,
        seller: s.seller,
        txHash: s.txHash,
        date: s.createdAt,
        isFirstSale: s.isFirstSale,
      }));

    return res.json({ success: true, history });
  } catch (err) {
    console.error(" GET PRICE HISTORY ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/v1/nft/finalize-by-payment-intent
 * Called directly by frontend after stripe.confirmPayment() succeeds.
 * Re-verifies payment with Stripe before executing — safe without webhook.
 * Webhook (if it fires in production) is deduplicated by paymentIntentId check.
 */
export async function finalizeByPaymentIntent(req, res) {
  const { paymentIntentId, parentId, subCollectionId, buyerWallet, priceETH, offerId } = req.body;

  if (!paymentIntentId || !subCollectionId || !buyerWallet) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    // 1. Verify payment with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ success: false, error: `Payment not succeeded (status: ${intent.status})` });
    }

    // 2. Dedup — if webhook already processed this, return success without re-running
    const existing = await Payment.findOne({ paymentIntentId });
    if (existing && !existing.nftTransferFailed) {
      console.log("ℹ️ [finalizeByPaymentIntent] Already processed by webhook:", paymentIntentId);
      return res.json({ success: true, alreadyProcessed: true });
    }

    // 3. Record payment (if not already recorded by webhook)
    if (!existing) {
      await Payment.create({
        userId: intent.metadata?.userId || "unknown",
        gameTitle: intent.metadata?.gameTitle || "NFT Purchase",
        amount: intent.amount,
        currency: intent.currency,
        provider: "stripe",
        transactionId: paymentIntentId,
        paymentIntentId,
        status: "succeeded",
        itemType: "nft",
        parentId: parentId || null,
        subCollectionId,
        buyerWallet,
        productId: intent.metadata?.productId || subCollectionId,
      }).catch(() => { });
    }

    // 4. Finalize NFT transfer
    const result = await finalizeNFAPurchase({
      parentId: parentId || null,
      subCollectionId,
      buyerWallet,
      priceETH: parseFloat(priceETH || 0),
      paymentProvider: "stripe",
      paymentIntentId,
    });

    // 5. Mark offer completed if applicable
    if (offerId) {
      markOfferCompleted(offerId).catch(err =>
        console.warn("⚠️ [Offer] markOfferCompleted error:", err.message)
      );
    }

    console.log("[finalizeByPaymentIntent] Done:", result);
    return res.json({ success: true, result });
  } catch (err) {
    console.error(" [finalizeByPaymentIntent] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Admin: fix existing subCollection items that have priceETH > 0 but listed = false.
 * Run once after deploying the auto-list fix.
 */
export async function fixUnlistedPricedItems(req, res) {
  try {
    const parents = await NFTSystem.find({ isParentCollection: true, status: "active" });
    let fixed = 0;

    for (const parent of parents) {
      let changed = false;
      for (const sub of parent.subCollections) {
        if (!sub.listed && sub.priceETH > 0) {
          sub.listed = true;
          changed = true;
          fixed++;
        }
      }
      if (changed) {
        parent.markModified("subCollections");
        await parent.save();
      }
    }

    return res.json({ success: true, message: `Fixed ${fixed} unlisted items with price > 0.`, fixed });
  } catch (err) {
    console.error("[fixUnlistedPricedItems] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
