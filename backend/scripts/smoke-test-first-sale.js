// Phase F smoke test: exercise the REAL first-sale flow (create item -> first purchase ->
// backend relayer mint) end-to-end on Base Sepolia testnet, against the real dev database.
// This path is architecturally different from the resale flow already smoke-tested
// (backend/scripts/smoke-test-reconcile-continue.cjs): item creation is DB-only, and the
// actual ERC-721 mint is executed by the backend's own relayer wallet via
// depositFirstSalePayment() + mintSubCollection(), not a direct wallet-to-wallet buyNFT() call.
// Not a permanent feature — a one-time verification pass before trusting this path with
// mainnet traffic. Uses the same dev-sandbox DB the app itself uses (Config/.env -> .env.local
// override), matching backend/scripts/fix_ownership.js's connection pattern.
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

console.log("Using MongoDB:", process.env.MONGODB_URL?.split("@")[1]?.split("/")[1]?.split("?")[0]);
await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

const { createItemDirect, mintSubCollection } = await import("../Controllers/nftController.js");
const NFTSystem = (await import("../Models/NFTSystem.js")).default;

function invoke(fn, { body, user }) {
  return new Promise((resolve) => {
    const req = { body, user: user || null, file: null };
    const res = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) { resolve({ status: this._status, payload }); },
    };
    fn(req, res).catch((err) => resolve({ status: 500, payload: { success: false, error: err.message } }));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const userA = ethers.Wallet.createRandom().connect(provider); // item creator
  const userB = ethers.Wallet.createRandom().connect(provider); // first buyer
  console.log("User B private key (for manual retry if this run fails):", userB.privateKey);

  console.log("User A (creator):", userA.address);
  console.log("User B (first buyer):", userB.address);

  const MarketplaceAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/Marketplace.json"), "utf-8"));
  const usdcAbi = [
    "function mint(address to, uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address) view returns (uint256)",
  ];
  const market = new ethers.Contract(process.env.MARKETPLACE_ADDRESS, MarketplaceAbi, deployer);
  const usdc = new ethers.Contract(process.env.BASE_USDC_ADDRESS, usdcAbi, deployer);

  const price = 100000n; // 0.1 USDC (6 decimals) — kept tiny, this is a real testnet asset

  console.log("\nFunding User B with testnet ETH for gas...");
  await (await deployer.sendTransaction({ to: userB.address, value: ethers.parseEther("0.000003") })).wait();
  await sleep(3000);

  console.log("Minting test USDC to User B...");
  await (await usdc.mint(userB.address, price)).wait();
  await sleep(3000);

  // ── Step 1: User A creates the item (DB-only, matches createItemDirect / AddUserCollection.jsx) ──
  console.log("\n--- Step 1: createItemDirect (item creation, no chain yet) ---");
  const createResult = await invoke(createItemDirect, {
    body: {
      name: "Smoke Test First-Sale Item",
      description: "Phase F smoke test",
      priceETH: "0.1",
      category: "general",
      assetType: "NFT", // plain NFT — self-service, no admin needed
      owner: userA.address,
    },
    user: { _id: null, role: "user" },
  });
  console.log(JSON.stringify(createResult, null, 2));
  if (!createResult.payload?.success) throw new Error("SMOKE TEST FAILED: createItemDirect did not succeed");

  const parentId = createResult.payload.parentId;
  const subCollectionId = createResult.payload.item._id;
  console.log("Created parentId:", parentId, "subCollectionId:", subCollectionId);

  // ── Step 2: User B pays via depositFirstSalePayment (real on-chain tx, matches Buy1.jsx:873-878) ──
  console.log("\n--- Step 2: depositFirstSalePayment (User B pays User A's escrow) ---");
  const usdcAsB = usdc.connect(userB);
  await (await usdcAsB.approve(await market.getAddress(), price)).wait();
  await sleep(4000); // public RPC replication lag between nodes — approve confirms on one node,
                      // estimateGas for the next tx can briefly hit a node that hasn't caught up yet
  const marketAsB = market.connect(userB);
  const depositTx = await marketAsB.depositFirstSalePayment(userA.address, price);
  const depositReceipt = await depositTx.wait();
  console.log("Deposit tx:", depositReceipt.hash);

  const creatorBalanceAfterDeposit = await market.creatorBalance(userA.address);
  if (creatorBalanceAfterDeposit !== price) {
    throw new Error(`SMOKE TEST FAILED: creatorBalance mismatch, expected ${price}, got ${creatorBalanceAfterDeposit}`);
  }
  console.log("creatorBalance[userA] correctly credited:", creatorBalanceAfterDeposit.toString());

  // ── Step 3: backend relayer mints + transfers to User B (matches mintNFTToWallet -> mintSubCollection) ──
  console.log("\n--- Step 3: mintSubCollection (backend relayer mints NFT to User B) ---");
  const mintResult = await invoke(mintSubCollection, {
    body: {
      parentId,
      subCollectionId,
      tokenURI: `ipfs://smoke-test-first-sale-${Date.now()}`,
      royaltyBps: 500,
      creatorWallet: userB.address, // NOTE: this param is actually the BUYER's wallet — confirmed via code trace
      chainId: 84532,
      priceETH: "0.1",
    },
  });
  console.log(JSON.stringify(mintResult, null, 2));
  if (!mintResult.payload?.success) throw new Error("SMOKE TEST FAILED: mintSubCollection did not succeed");

  const tokenId = mintResult.payload.tokenId;
  console.log("Minted tokenId:", tokenId);

  // ── Step 4: verify on-chain and DB state agree ──
  console.log("\n--- Step 4: verify on-chain + DB state ---");
  const nftAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const nft = new ethers.Contract(process.env.MYNFT_ADDRESS, nftAbi, provider);
  const onChainOwner = await nft.ownerOf(tokenId);
  console.log("On-chain ownerOf(tokenId):", onChainOwner);
  if (onChainOwner.toLowerCase() !== userB.address.toLowerCase()) {
    throw new Error(`SMOKE TEST FAILED: on-chain owner mismatch, expected ${userB.address}, got ${onChainOwner}`);
  }

  const parentDoc = await NFTSystem.findById(parentId);
  const subDoc = parentDoc.subCollections.id(subCollectionId);
  console.log("DB subCollection.owner:", subDoc.owner, "listed:", subDoc.listed, "tokenId:", subDoc.tokenId);
  if (subDoc.owner?.toLowerCase() !== userB.address.toLowerCase()) {
    throw new Error(`SMOKE TEST FAILED: DB owner mismatch, expected ${userB.address}, got ${subDoc.owner}`);
  }
  if (subDoc.listed !== false) throw new Error("SMOKE TEST FAILED: DB listed flag should be false after sale");

  console.log("\n✅ SMOKE TEST PASSED — first-sale flow (create -> deposit -> relayer mint) works correctly end-to-end.");
}

main()
  .catch((err) => {
    console.error("\n❌ SMOKE TEST ERROR:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
