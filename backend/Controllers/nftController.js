// Controllers/nftController.js - COMPLETE VERSION
import NFTSystem from "../Models/NFTSystem.js";
import {
  getBlockchain,
  ethers,
  formatEther,
} from "../Service/blockchain.js";

/**
 * Create Parent Collection (Characters, Land, etc.)
 */
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
      category: category.toLowerCase(),
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
    console.error("❌ CREATE PARENT COLLECTION ERROR:", err);
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
      ? `/uploads/temp/${req.file.filename}`
      : req.body.image || parent.collection.image;

    const subCollection = {
      name: name || "", // optional now
      symbol: symbol || "", // optional now
      image,
      description: description || "",
      owner: owner || parent.collection.owner || "admin",
      creator: creator || "admin",
      listed: false,
      priceETH: priceETH || 0,
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
    console.error("❌ ADD SUB-COLLECTION ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Parent Collections by Category
 */
export async function getParentCollections(req, res) {
  try {
    const { category } = req.query;

    let query = { isParentCollection: true, status: "active" };

    if (category) {
      query.category = category.toLowerCase();
    }

    const collections = await NFTSystem.find(query)
      .select("collection category subCollections createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      collections,
      count: collections.length,
    });
  } catch (err) {
    console.error("❌ GET PARENT COLLECTIONS ERROR:", err);
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
    console.error("❌ GET SUB-COLLECTIONS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update Sub-Collection
 */
export async function updateSubCollection(req, res) {
  try {
    const { parentId, subCollectionId } = req.params;
    const { name, symbol, description, priceETH, listed } = req.body;

    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    const subCollection = parent.subCollections.id(subCollectionId);
    if (!subCollection) {
      return res.status(404).json({ error: "Sub-collection not found" });
    }

    if (name) subCollection.name = name;
    if (symbol) subCollection.symbol = symbol;
    if (description !== undefined) subCollection.description = description;
    if (priceETH !== undefined) subCollection.priceETH = priceETH;
    if (listed !== undefined) subCollection.listed = listed;

    if (req.file) {
      subCollection.image = `/uploads/temp/${req.file.filename}`;
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
    console.error("❌ UPDATE SUB-COLLECTION ERROR:", err);
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

    parent.subCollections.pull(subCollectionId);
    await parent.save();

    return res.json({
      success: true,
      message: "Sub-collection deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE SUB-COLLECTION ERROR:", err);
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

    // ✅ Validation
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

    // ✅ Find parent collection
    const parent = await NFTSystem.findById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: "Parent collection not found",
      });
    }

    // ✅ Find sub-collection within parent
    const subCollection = parent.subCollections.id(subCollectionId);
    if (!subCollection) {
      return res.status(404).json({
        success: false,
        error: "Sub-collection not found",
      });
    }

    // ✅ Check if already minted
    if (subCollection.tokenId) {
      return res.status(400).json({
        success: false,
        error: "NFT already minted",
        tokenId: subCollection.tokenId,
      });
    }

    // ✅ BlockChain Initialization
    const chainId = req.body.chainId || 84532; // Default to Base Sepolia if not provided
    console.log(`🔗 Minting on Chain ID: ${chainId}`);

    const { nftContract, wallet: backendWalletObj, provider } = getBlockchain(chainId);

    if (!nftContract || !provider || !backendWalletObj) {
      return res.status(500).json({
        success: false,
        error: "Blockchain not initialized for this chain",
      });
    }

    // ✅ Backend wallet balance check
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
      // ✅ Fetch the latest confirmed nonce to avoid NONCE_EXPIRED errors
      let currentNonce = await provider.getTransactionCount(backendWallet, "latest");
      console.log(`📡 Current Nonce: ${currentNonce}`);

      // ✅ Mint NFT on blockchain
      console.log("🎨 Minting NFT...");
      console.log("- TokenURI:", tokenURI);
      console.log("- RoyaltyBps:", royaltyBps || 500);

      tx = await nftContract.mint(creatorWallet, tokenURI, royaltyBps || 500, { nonce: currentNonce });
      console.log("📤 Mint Transaction sent:", tx.hash);

      receipt = await tx.wait();
      console.log("✅ Confirmed in block:", receipt.blockNumber);
      currentNonce++; // Increment nonce for next tx

      // ✅ Extract TokenId from events
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
        throw new Error("❌ Failed to retrieve Token ID from transaction receipt. Logs did not contain Transfer or Minted event.");
      }

      // ✅ Transfer ownership (with L2 node indexing retry loop)
      let owner;
      let retries = 20;
      while (retries > 0) {
        try {
          // If this succeeds, the node has indexed the token!
          owner = await nftContract.ownerOf(tokenId);
          if (owner) {
             console.log(`✅ Node indexed Token #${tokenId}. Owner is ${owner}.`);
             break;
          }
        } catch (err) {
          console.log(`⏳ Node hasn't indexed Token #${tokenId} yet... (${retries - 1} left)`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        }
      }

      if (retries === 0) {
        throw new Error(`❌ Blockchain node failed to index NFT #${tokenId} after 60 seconds.`);
      }

      console.log(`⚠️ Transferring token ${tokenId} from backend to ${creatorWallet}...`);
      const transferTx = await nftContract.transferFrom(
        backendWallet,
        creatorWallet,
        tokenId,
        { nonce: currentNonce }
      );
      await transferTx.wait();
      console.log("✅ NFT transferred to:", creatorWallet);
      currentNonce++;

      // ✅ Mark as sold so smart contract treats next sale as secondary
      const markTx = await nftContract.markAsSold(tokenId, { nonce: currentNonce });
      await markTx.wait();
      console.log("✅ Marked as sold on contract (isFirstSale = false)");
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

    // ✅ Update Database - ONLY sub-collection
    console.log("💾 Updating database...");

    subCollection.tokenId = tokenId;
    subCollection.tokenURI = tokenURI;
    subCollection.owner = creatorWallet.toLowerCase();
    subCollection.listed = false;

    // ✅ Record Mint as First Sale
    console.log("📝 Recording Mint Sale...");
    const mintPrice = req.body.priceETH || subCollection.priceETH || 0;
    
    const deployerWallet = (process.env.PLATFORM_WALLET_ADDRESS || "").toLowerCase();
    const saleRecord = {
      buyer: creatorWallet.toLowerCase(),
      seller: deployerWallet || "unknown", // Actual deployer wallet address
      priceETH: String(mintPrice || "0"), // Already human-readable decimal
      royaltyPaid: String(mintPrice || "0"), // 100% to creator/project on first sale
      platformFee: 0,
      sellerReceived: 0,
      txHash: receipt.hash,
      isFirstSale: true,
      createdAt: new Date(),
    };

    if (!subCollection.salesHistory) subCollection.salesHistory = [];
    subCollection.salesHistory.push(saleRecord);
    
    // Mark as sold (next sale will be secondary)
    subCollection.isFirstSale = false; 
    
    // Increment parent sales count
    parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;

    // ✅ FORCE SAVE
    parent.markModified('subCollections');
    await parent.save();

    console.log("✅ Mint completed!");
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
    console.error("❌ SERVER ERROR:", err);

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
      tx = await nftContract.mint(creatorWallet, tokenURI, royaltyBps || 500);
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
            tokenId,
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
      { new: true },
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
      { new: true },
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

    // ✅ CRITICAL: Sanitize priceETH — parseFloat to ensure clean number, never scientific notation
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

    console.log(`✅ Sale recorded: Token ${tokenId} sold to ${buyer} for ${priceUSDC} USDC`);

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
      details: err.toString(),
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
  sellerWallet,
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
      },
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
      { new: true },
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
    console.error("❌ GET NFTs BY WALLET ERROR:", err);
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
    console.error("❌ GET NFTs WITH SUB-COLLECTIONS ERROR:", err);
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

    if (!tokenId || !seller || !priceETH) {
      return res.status(400).json({
        error: "Missing required fields: tokenId, seller, priceETH",
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

    console.log("✅ Found parent:", parent._id);

    // Find sub-collection
    const subCollection = subCollectionId
      ? parent.subCollections.id(subCollectionId)
      : parent.subCollections.find((sub) => sub.tokenId === tokenId);

    if (!subCollection) {
      return res.status(404).json({ error: "Sub-collection not found" });
    }

    console.log("✅ Found sub-collection:", subCollection._id);

    // Verify ownership
    if (subCollection.owner.toLowerCase() !== seller.toLowerCase()) {
      return res.status(403).json({
        error: "You don't own this sub-collection",
        currentOwner: subCollection.owner,
        providedSeller: seller,
      });
    }

    // Update sub-collection listing status
    subCollection.listed = true;
    subCollection.priceETH = priceETH;

    await parent.save();

    console.log(`✅ Sub-collection ${tokenId} listed for ${priceETH} ETH`);

    return res.json({
      success: true,
      message: "Sub-collection listed successfully",
      subCollection,
      parentId: parent._id,
    });
  } catch (err) {
    console.error("❌ CREATE SUB-COLLECTION LISTING ERROR:", err);
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
    if (subCollection.owner.toLowerCase() !== seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Seller does not match sub-collection owner",
        expectedSeller: subCollection.owner,
        providedSeller: seller,
      });
    }

    const creatorWallet =
      parent.collection?.royaltyWallet || parent.collection?.owner;

    // ✅ Sanitize priceETH to prevent scientific notation in DB (e.g. 2e-10 → 200)
    const cleanPrice = parseFloat(String(priceETH));
    const priceUSDC = isNaN(cleanPrice) ? 0 : parseFloat(cleanPrice.toFixed(6));
    console.log(`💰 Sub-collection sale: ${priceUSDC} USDC (raw received: ${priceETH})`);

    // Calculate payment distribution
    const distribution = calculatePaymentDistribution(
      priceUSDC,
      subCollection.isFirstSale,
      creatorWallet,
      seller,
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
      isFirstSale: subCollection.isFirstSale,
      createdAt: new Date(),
    };

    console.log("📝 Adding Sale Record:", saleRecord);

    // Update sub-collection
    if (!subCollection.salesHistory) {
      subCollection.salesHistory = [];
    }
    
    subCollection.salesHistory.push(saleRecord);
    subCollection.owner = buyer.toLowerCase();
    subCollection.seller = null;
    subCollection.buyer = null;
    subCollection.listed = false;
    subCollection.priceETH = null;

    if (subCollection.isFirstSale) {
      subCollection.isFirstSale = false;
    }

    // Update parent collection sales count
    parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;

    // ✅ FORCE SAVE with extra logging
    console.log("💾 Saving Parent Collection...");
    parent.markModified('subCollections');
    
    const savedParent = await parent.save();
    
    // Verify save
    const savedSub = savedParent.subCollections.id(subCollection._id);
    console.log("✅ Saved Sub-Collection Sales History Length:", savedSub?.salesHistory?.length);
    console.log("✅ Saved Sub-Collection Owner:", savedSub?.owner);
    console.log("✅ Saved Sub-Collection Listed:", savedSub?.listed);

    console.log(
      `✅ Sub-collection sale recorded: Token ${tokenId} sold to ${buyer}`,
    );

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
    console.error("❌ RECORD SUB-COLLECTION SALE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function cancelSubCollectionListing(req, res) {
  try {
    const { nftId, tokenId } = req.body;

    console.log("🚀 CANCEL SUB-COLLECTION LISTING REQUEST:", {
      nftId,
      tokenId,
      tokenIdType: typeof tokenId,
      time: new Date().toISOString(),
    });

    // 1. Validate required fields
    if (!nftId || tokenId === undefined) {
      return res.status(400).json({
        success: false,
        error: "nftId and tokenId are required",
      });
    }

    // 2. Find parent collection
    const parent = await NFTSystem.findById(nftId);
    if (!parent) {
      console.error("❌ Parent collection not found with ID:", nftId);
      return res.status(404).json({
        success: false,
        error: "Parent collection not found",
      });
    }

    console.log("✅ Found parent:", {
      id: parent._id,
      name: parent.collection?.name,
      subCollectionsCount: parent.subCollections?.length || 0,
    });

    // 3. Convert tokenId to number
    const tokenIdNum = parseInt(tokenId);
    if (isNaN(tokenIdNum)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tokenId: ${tokenId}`,
      });
    }

    console.log("🔍 Looking for sub-collection with tokenId:", tokenIdNum);

    // 4. Find sub-collection by tokenId
    const subCollection = parent.subCollections.find(
      (sub) => sub.tokenId === tokenIdNum,
    );

    if (!subCollection) {
      console.error("❌ Sub-collection not found with tokenId:", tokenIdNum);
      console.log(
        "Available tokenIds:",
        parent.subCollections.map((sub) => sub.tokenId),
      );
      return res.status(404).json({
        success: false,
        error: `Sub-collection with tokenId ${tokenIdNum} not found`,
        availableTokenIds: parent.subCollections.map((sub) => sub.tokenId),
      });
    }

    console.log("✅ Found sub-collection:", {
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

    console.log("✅ Successfully cancelled listing:", {
      tokenId: tokenIdNum,
      newListed: false,
      newPriceETH: null,
    });

    // 7. Verify the update
    const verifiedParent = await NFTSystem.findById(nftId);
    const verifiedSub = verifiedParent.subCollections.find(
      (sub) => sub.tokenId === tokenIdNum,
    );

    console.log("✅ Verification:", {
      listed: verifiedSub.listed,
      priceETH: verifiedSub.priceETH,
    });

    return res.json({
      success: true,
      message: "Listing cancelled successfully",
      parentId: nftId, // ✅ Direct return for frontend
      tokenId: tokenIdNum,
      details: {
        newListed: verifiedSub.listed,
        newPriceETH: verifiedSub.priceETH,
      },
    });
  } catch (err) {
    console.error("❌ CANCEL SUB-COLLECTION LISTING ERROR:", {
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
    console.error("❌ GET OWNED SUB-COLLECTIONS ERROR:", err);
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
    const parents = await NFTSystem.find({
      "subCollections.owner": walletLower,
      "subCollections.listed": true,
      status: "active",
      isParentCollection: true,
    }).select("collection.name collection.image category subCollections");

    console.log("✅ Found parent collections:", parents.length);

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
            parentId: parent._id, // ✅ CRITICAL - parent ID for cancel listing
            parentName: parent.collection?.name,
            parentImage: parent.collection?.image,
            category: parent.category,
          },
        });
      });
    });

    console.log(
      "✅ Total listed sub-collections:",
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
    console.error("❌ GET LISTED SUB-COLLECTIONS ERROR:", err);
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

    console.log("✅ Regular Minted NFTs:", regularMintedNFTs.length);

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

    console.log("✅ Minted Sub-Collections:", parentsWithMintedSubs.length);

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

    console.log("✅ Regular Listed NFTs:", regularListedNFTs.length);

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

    console.log("✅ Listed Sub-Collections:", parentsWithListedSubs.length);

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
    console.log("✅ Dashboard Stats Compiled Successfully");
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
    console.error("❌ GET DASHBOARD STATS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}