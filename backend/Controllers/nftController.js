// Controllers/nftController.js - FIXED VERSION
import NFTSystem from "../Models/NFTSystem.js";
import { nftContract, marketContract, wallet, ethers, formatEther } from "../Service/blockchain.js";


/**
 * Create Collection (store metadata)
 */
export async function createCollection(req, res) {
  try {
    // Extract data from body
    const { 
      name, 
      symbol, 
      Type, 
      chain, 
      owner, 
      royaltyPercent, 
      royaltyWallet, 
      supply
    } = req.body;

    // ✅ FIX: Detect creator info from authenticated user
    // Check both Role (uppercase) and role (lowercase) from token
    const userRole = req.user?.Role || req.user?.role;
    const isAdmin = userRole?.toLowerCase() === "admin";
    const creatorType = isAdmin ? "admin" : "user";
    
    // ✅ FIX: Only set userId for regular users, NOT for admins
    // Check both _id and id from token
    const userId = isAdmin ? null : (req.user?._id || req.user?.id || null);
    const creatorWallet = owner; // collection owner wallet

    // console.log("📝 Creating Collection:");
    // console.log("- User from token:", req.user);
    // console.log("- User Role detected:", userRole);
    // console.log("- Is Admin:", isAdmin);
    // console.log("- UserID will be:", userId);
    // console.log("- Creator Type:", creatorType);

    // Validate required fields
    if (!name || !symbol || !chain || !owner) {
      return res.status(400).json({
        error: "Missing required fields: name, symbol, chain, owner"
      });
    }

    // Handle image
    let image;
    if (req.file) {
      image = `/uploads/temp/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({
        error: "Image is required (file or URL)."
      });
    }

    const finalRoyaltyWallet = royaltyWallet || owner;

    // ✅ FIX: Create collection with proper userId handling
    const doc = await NFTSystem.create({
      userId: userId, // null for admin, actual ID for users
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
        creator: creatorType, // "admin" or "user"
        salesCount: 0 // Initialize sales count
      },
      creator: creatorWallet, // blockchain wallet address
      owner: creatorWallet,
      status: "active"
    });

    // console.log("✅ Collection created successfully:", doc._id);
    // console.log("- Collection userId:", doc.userId);
    // console.log("- Collection creator type:", doc.collection.creator);

    return res.json({ 
      success: true, 
      message: `Collection created by ${creatorType}`,
      doc,
      createdBy: {
        role: userRole,
        userId: userId,
        type: creatorType,
        isAdmin: isAdmin
      }
    });
  } catch (err) {
    console.error("❌ CREATE COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}




/**
 * Server-side Mint NFT
 */
export async function serverMint(req, res) {
  try {
    const { docId, tokenURI, royaltyBps, creatorWallet } = req.body;
    
    if (!nftContract) {
      return res.status(500).json({ error: "NFT contract not initialized" });
    }

    // Mint NFT on blockchain
    const tx = await nftContract.mint(tokenURI, royaltyBps || 500); // 500 = 5%
    const receipt = await tx.wait();

    // Extract tokenId from Minted event
    let tokenId;
    const mintedEvent = receipt.logs.find(log => {
      try {
        const parsed = nftContract.interface.parseLog(log);
        return parsed && parsed.name === "Minted";
      } catch (e) {
        return false;
      }
    });

    if (mintedEvent) {
      const parsed = nftContract.interface.parseLog(mintedEvent);
      tokenId = Number(parsed.args[1]);
    } else {
      const next = await nftContract.nextTokenId();
      tokenId = Number(next) - 1;
    }

    // Update database with creator wallet
    const nftDoc = await NFTSystem.findByIdAndUpdate(docId, {
      tokenId,
      tokenURI,
      creator: creatorWallet || wallet.address, // Store the actual creator
      owner: creatorWallet || wallet.address,
      listed: false,
      isFirstSale: true
    }, { new: true });

    return res.json({ 
      success: true, 
      tokenId, 
      nftDoc,
      txHash: receipt.hash 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Create Listing (Update DB after frontend creates blockchain listing)
 */
export async function createListing(req, res) {
  try {
    const { nftId, tokenId, seller, priceETH } = req.body;
    
    const nft = await NFTSystem.findByIdAndUpdate(nftId, {
      listed: true, 
      priceETH, 
      seller
    }, { new: true });

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    return res.json({ success: true, nft });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Listing Details (for display on frontend)
 */
export async function getListingDetails(req, res) {
  try {
    const { tokenId } = req.params;
    
    const nft = await NFTSystem.findOne({ tokenId: Number(tokenId) });
    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    // Get blockchain listing data
    let blockchainListing = null;
    if (marketContract && process.env.MYNFT_ADDRESS) {
      try {
        const listing = await marketContract.getListing(
          process.env.MYNFT_ADDRESS, 
          tokenId
        );
        blockchainListing = {
          seller: listing[0],
          price: formatEther(listing[1]),
          active: listing[2]
        };
      } catch (err) {
        console.error("Error fetching blockchain listing:", err);
      }
    }

    return res.json({ 
      success: true, 
      nft,
      blockchainListing
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Calculate payment distribution
 * IMPORTANT: This matches your smart contract logic
 */
function calculatePaymentDistribution(priceETH, isFirstSale, creatorWallet, sellerWallet) {
  const PLATFORM_FEE_PERCENT = 10;
  const CREATOR_ROYALTY_PERCENT = 5;
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
  
  let distribution = {
    sellerAmount: 0,
    creatorAmount: 0,
    platformAmount: 0,
    payments: []
  };

  if (isFirstSale) {
    // First sale: 100% to creator
    distribution.creatorAmount = priceETH;
    distribution.payments.push({
      recipient: creatorWallet,
      amount: priceETH,
      percentage: 100,
      type: "creator_first_sale"
    });
  } else {
    // Subsequent sales: 5% creator, 10% platform, 85% seller
    distribution.creatorAmount = (priceETH * CREATOR_ROYALTY_PERCENT) / 100;
    distribution.platformAmount = (priceETH * PLATFORM_FEE_PERCENT) / 100;
    distribution.sellerAmount = priceETH - distribution.creatorAmount - distribution.platformAmount;

    distribution.payments.push(
      {
        recipient: creatorWallet,
        amount: distribution.creatorAmount,
        percentage: 5,
        type: "creator_royalty"
      },
      {
        recipient: platformWallet,
        amount: distribution.platformAmount,
        percentage: 10,
        type: "platform_fee"
      },
      {
        recipient: sellerWallet,
        amount: distribution.sellerAmount,
        percentage: 85,
        type: "seller_proceeds"
      }
    );
  }

  return distribution;
}

/**
 * Record On-chain Sale (Called AFTER blockchain transaction completes)
 * This is called by frontend after successful buyNFT transaction
 */
export async function recordOnchainSale(req, res) {
  try {
    const { tokenId, buyer, seller, priceETH, txHash } = req.body;

    if (!tokenId || !buyer || !seller || !priceETH || !txHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nft = await NFTSystem.findOne({ tokenId: Number(tokenId) });
    if (!nft) return res.status(404).json({ error: "NFT not found" });

    if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
      return res.status(400).json({ error: "Seller does not match NFT owner" });
    }

    const creatorWallet = nft.collection?.royaltyWallet || nft.creator;

    // Payment distribution
    const distribution = calculatePaymentDistribution(
      priceETH, 
      nft.isFirstSale, 
      creatorWallet,
      seller
    );

    // Record sale in NFT salesHistory
    const saleRecord = {
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      priceETH: priceETH,
      royaltyPaid: distribution.creatorAmount,
      platformFee: distribution.platformAmount,
      sellerReceived: distribution.sellerAmount,
      txHash: txHash,
      isFirstSale: nft.isFirstSale,
      createdAt: new Date()
    };

    nft.salesHistory.push(saleRecord);

    // Update NFT state
    nft.owner = buyer.toLowerCase();
    nft.seller = buyer.toLowerCase();
    nft.buyer = null;
    nft.listed = false;
    nft.priceETH = 0;
    if (nft.isFirstSale) nft.isFirstSale = false;

    // ✅ Increment collection sales count for popularity
    nft.collection.salesCount = (nft.collection.salesCount || 0) + 1;

    await nft.save();

    return res.json({
      success: true,
      message: "Sale recorded successfully",
      nft: {
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        seller: nft.seller,
        buyer: nft.buyer,
        isFirstSale: nft.isFirstSale,
        collectionSalesCount: nft.collection.salesCount
      },
      sale: saleRecord,
      paymentDistribution: {
        total: priceETH,
        breakdown: distribution.payments.map(p => ({
          recipient: p.recipient,
          amount: p.amount,
          percentage: p.percentage,
          type: p.type,
          amountETH: p.amount.toFixed(4)
        })),
        wasFirstSale: saleRecord.isFirstSale
      }
    });
  } catch (err) {
    console.error("Error recording sale:", err);
    return res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}


export async function getPopularCollections(req, res) {
  try {
    const topN = parseInt(req.query.top) || 10; // Default top 10

    const collections = await NFTSystem.find({ "status": "active" })
      .sort({ "collection.salesCount": -1 })
      .limit(topN)
      .select("collection tokenId owner listed priceETH createdAt isFirstSale");

    return res.json({
      success: true,
      collections,
      count: collections.length
    });
  } catch (err) {
    console.error("getPopularCollections error:", err);
    return res.status(500).json({ error: err.message });
  }
}


/**
 * Get royalties summary for a specific creator
 */
export async function getRoyaltiesSummary(req, res) {
  try {
    const { creatorWallet } = req.query;
    
    let matchStage = {};
    if (creatorWallet) {
      matchStage = { 
        $or: [
          { creator: creatorWallet },
          { "collection.owner": creatorWallet },
          { "collection.royaltyWallet": creatorWallet }
        ]
      };
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$salesHistory" },
      { $group: {
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
                0
              ]
            }
          },
          subsequentRoyalties: {
            $sum: {
              $cond: [
                { $eq: ["$salesHistory.isFirstSale", false] },
                "$salesHistory.royaltyPaid",
                0
              ]
            }
          }
      }},
      { $sort: { totalRoyaltyEarned: -1 } }
    ];
    
    const result = await NFTSystem.aggregate(pipeline);
    
    return res.json({ 
      success: true, 
      summary: result.map(r => ({
        ...r,
        totalRoyaltyEarnedETH: r.totalRoyaltyEarned.toFixed(4),
        totalSalesValueETH: r.totalSalesValue.toFixed(4),
        firstSaleEarningsETH: r.firstSaleEarnings.toFixed(4),
        subsequentRoyaltiesETH: r.subsequentRoyalties.toFixed(4)
      }))
    });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get platform revenue
 */
export async function getPlatformRevenue(req, res) {
  try {
    const pipeline = [
      { $unwind: "$salesHistory" },
      { 
        $match: {
          "salesHistory.isFirstSale": false // Only count platform fees from secondary sales
        }
      },
      {
        $group: {
          _id: null,
          totalPlatformFees: { $sum: "$salesHistory.platformFee" },
          totalTransactionValue: { $sum: "$salesHistory.priceETH" },
          transactionCount: { $sum: 1 },
          averageTransactionValue: { $avg: "$salesHistory.priceETH" }
        }
      }
    ];
    
    const result = await NFTSystem.aggregate(pipeline);
    
    const revenue = result[0] || {
      totalPlatformFees: 0,
      totalTransactionValue: 0,
      transactionCount: 0,
      averageTransactionValue: 0
    };

    return res.json({ 
      success: true, 
      platformRevenue: {
        ...revenue,
        totalPlatformFeesETH: revenue.totalPlatformFees.toFixed(4),
        totalTransactionValueETH: revenue.totalTransactionValue.toFixed(4),
        averageTransactionValueETH: revenue.averageTransactionValue.toFixed(4)
      }
    });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get NFT by ID
 */
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

/**
 * Get all NFTs by owner
 */
export async function getNFTsByOwner(req, res) {
  try {
    const { owner } = req.query;
    if (!owner) return res.status(400).json({ error: "Owner address required" });

    const nfts = await NFTSystem.find({ owner: owner.toLowerCase(), status: "active" }) // <-- filter active
      .sort({ createdAt: -1 });

    return res.json({ success: true, nfts, count: nfts.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get all NFTs by creator
 */
export async function getNFTsByCreator(req, res) {
  try {
    const { creator } = req.query;
    if (!creator) return res.status(400).json({ error: "Creator address required" });

    const nfts = await NFTSystem.find({ creator: creator.toLowerCase(), status: "active" }) // <-- filter active
      .sort({ createdAt: -1 });

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
      nfts
    });
  } catch (err) {
    console.error("getAllNFTs error:", err);
    return res.status(500).json({ error: err.message });
  }
}


// Collection CRUD operations
export async function getAllCollections(req, res) {
  try {
    const collections = await NFTSystem.find({ "status": "active" }) // <-- filter active
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

    // Status validation
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check NFT exists
    const nft = await NFTSystem.findById(id);
    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    // Update status (no restrictions)
    nft.status = status;
    await nft.save();

    return res.json({
      success: true,
      message: `NFT status updated to ${status}`,
      nft
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
      supply,
      creator
    } = req.body;

    // Find existing collection
    const existing = await NFTSystem.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Handle image
    let image = existing.collection.image; // keep old
    if (req.file) {
      image = `/uploads/temp/${req.file.filename}`;
    }

    const updated = await NFTSystem.findByIdAndUpdate(
      id,
      {
        "collection.name": name || existing.collection.name,
        "collection.symbol": symbol || existing.collection.symbol,
        "collection.Type": Type || existing.collection.Type,
        "collection.chain": chain || existing.collection.chain,
        "collection.image": image,
        "collection.owner": owner || existing.collection.owner,
        "collection.royaltyPercent": royaltyPercent ?? existing.collection.royaltyPercent,
        "collection.royaltyWallet": royaltyWallet || existing.collection.royaltyWallet,
        "collection.creator": creator || existing.collection.creator,
        "collection.supply": supply || existing.collection.supply,
        "collection.status": status || existing.collection.status
      },
      { new: true }
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
    const deleted = await NFTSystem.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Collection not found" });
    }

    return res.json({ 
      success: true, 
      message: "Collection deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}


/**
 * Get total counts: collections, NFTs, sales (all, not just active)
 */
export async function getTotalCounts(req, res) {
  try {
    // Total collections (all)
    const totalCollections = await NFTSystem.countDocuments({});

    // Total NFTs
    const totalNFTs = await NFTSystem.countDocuments({});

    // Total sales (sum of all salesHistory lengths)
    const nftsWithSales = await NFTSystem.find({}, "salesHistory");
    let totalSalesCount = 0;
    nftsWithSales.forEach(nft => {
      totalSalesCount += nft.salesHistory.length;
    });

    // Total buys = same as total sales
    const totalBuysCount = totalSalesCount;

    return res.json({
      success: true,
      totalCollections,
      totalNFTs,
      totalSalesCount,
      totalBuysCount
    });
  } catch (err) {
    console.error("getTotalCounts error:", err);
    return res.status(500).json({ error: err.message });
  }
}
