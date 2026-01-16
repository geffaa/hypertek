// Controllers/nftController.js - COMPLETE VERSION
import NFTSystem from "../Models/NFTSystem.js";
import {
  nftContract,
  marketContract,
  wallet,
  ethers,
  formatEther,
  provider,
} from "../Service/blockchain.js";

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
      image = `/uploads/temp/${req.file.filename}`;
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
    console.error("❌ CREATE COLLECTION ERROR:", err);
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
      tx = await nftContract.mint(tokenURI, royaltyBps || 500);
      console.log("📤 Transaction sent:", tx.hash);

      receipt = await tx.wait();
      console.log("✅ Confirmed in block:", receipt.blockNumber);

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
      console.log("✅ Current owner:", owner);

      const expectedOwner = creatorWallet.toLowerCase();
      const actualOwner = owner.toLowerCase();

      if (actualOwner !== expectedOwner) {
        console.log("⚠️ Ownership mismatch - transferring...");

        if (actualOwner === walletAddress.toLowerCase()) {
          const transferTx = await nftContract.transferFrom(
            walletAddress,
            creatorWallet,
            tokenId
          );
          await transferTx.wait();
          console.log("✅ NFT transferred to:", creatorWallet);
        } else {
          throw new Error(`Cannot transfer - owned by: ${actualOwner}`);
        }
      }
    } catch (mintErr) {
      console.error("❌ Mint error:", mintErr);

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
      { new: true }
    );

    console.log("✅ Mint completed!");
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
    console.error("❌ SERVER ERROR:", err);

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
      { new: true }
    );

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    console.log(`✅ NFT ${tokenId} listed for ${priceETH} ETH`);

    return res.json({
      success: true,
      message: "NFT listed successfully",
      nft,
    });
  } catch (err) {
    console.error("❌ CREATE LISTING ERROR:", err);
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

    const creatorWallet = nft.collection?.royaltyWallet || nft.creator;

    // Calculate payment distribution
    const distribution = calculatePaymentDistribution(
      priceETH,
      nft.isFirstSale,
      creatorWallet,
      seller
    );

    // Record sale
    const saleRecord = {
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      priceETH: priceETH,
      royaltyPaid: distribution.creatorAmount,
      platformFee: distribution.platformAmount,
      sellerReceived: distribution.sellerAmount,
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

    console.log(`✅ Sale recorded: Token ${tokenId} sold to ${buyer}`);

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
    console.error("❌ RECORD SALE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * Calculate payment distribution
 */
function calculatePaymentDistribution(
  priceETH,
  isFirstSale,
  creatorWallet,
  sellerWallet
) {
  const PLATFORM_FEE_PERCENT = 10;
  const CREATOR_ROYALTY_PERCENT = 5;
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;

  let distribution = {
    sellerAmount: 0,
    creatorAmount: 0,
    platformAmount: 0,
    payments: [],
  };

  if (isFirstSale) {
    // First sale: 100% to creator
    distribution.creatorAmount = priceETH;
    distribution.payments.push({
      recipient: creatorWallet,
      amount: priceETH,
      percentage: 100,
      type: "creator_first_sale",
    });
  } else {
    // Secondary sales: 5% creator royalty, 10% platform fee, 85% to seller
    distribution.creatorAmount = (priceETH * CREATOR_ROYALTY_PERCENT) / 100;
    distribution.platformAmount = (priceETH * PLATFORM_FEE_PERCENT) / 100;
    distribution.sellerAmount =
      priceETH - distribution.creatorAmount - distribution.platformAmount;

    distribution.payments.push(
      {
        recipient: creatorWallet,
        amount: distribution.creatorAmount,
        percentage: 5,
        type: "creator_royalty",
      },
      {
        recipient: platformWallet,
        amount: distribution.platformAmount,
        percentage: 10,
        type: "platform_fee",
      },
      {
        recipient: sellerWallet,
        amount: distribution.sellerAmount,
        percentage: 85,
        type: "seller_proceeds",
      }
    );
  }

  return distribution;
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
          tokenId
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
    console.error("❌ GET LISTING ERROR:", err);
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
    console.error("❌ GET POPULAR COLLECTIONS ERROR:", err);
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
    console.error("❌ GET ROYALTIES ERROR:", err);
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
    console.error("❌ GET PLATFORM REVENUE ERROR:", err);
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
      image = `/uploads/temp/${req.file.filename}`;
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
      { new: true }
    );

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    console.log(`✅ Listing cancelled for Token #${tokenId}`);

    return res.json({
      success: true,
      message: "Listing cancelled successfully",
      nft,
    });
  } catch (err) {
    console.error("❌ CANCEL LISTING ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
