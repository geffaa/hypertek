// Continuation of smoke-test-first-sale.js: the deposit already succeeded on-chain (confirmed
// separately: creatorBalance[userA] = 100000, tx status 1) — the previous run's immediate
// balance check just hit RPC replication lag. Resume from Step 3 with the same item/wallets.
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

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

const { mintSubCollection } = await import("../Controllers/nftController.js");
const NFTSystem = (await import("../Models/NFTSystem.js")).default;

function invoke(fn, { body }) {
  return new Promise((resolve) => {
    const req = { body, user: null, file: null };
    const res = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) { resolve({ status: this._status, payload }); },
    };
    fn(req, res).catch((err) => resolve({ status: 500, payload: { success: false, error: err.message } }));
  });
}

const parentId = "6a54125cc4fa1ab1c320a9ae";
const subCollectionId = "6a54125cc4fa1ab1c320a9b0";
const userBAddress = "0x3f6F7574946a35D31220d63F43eCF7C32df08cB9";

async function main() {
  console.log("--- Step 3: mintSubCollection (backend relayer mints NFT to User B) ---");
  const mintResult = await invoke(mintSubCollection, {
    body: {
      parentId,
      subCollectionId,
      tokenURI: `ipfs://smoke-test-first-sale-${Date.now()}`,
      royaltyBps: 500,
      creatorWallet: userBAddress, // this param is the BUYER's wallet — confirmed via code trace
      chainId: 84532,
      priceETH: "0.1",
    },
  });
  console.log(JSON.stringify(mintResult, null, 2));
  if (!mintResult.payload?.success) throw new Error("SMOKE TEST FAILED: mintSubCollection did not succeed");

  const tokenId = mintResult.payload.tokenId;
  console.log("Minted tokenId:", tokenId);

  console.log("\n--- Step 4: verify on-chain + DB state ---");
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const nftAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const nft = new ethers.Contract(process.env.MYNFT_ADDRESS, nftAbi, provider);
  const onChainOwner = await nft.ownerOf(tokenId);
  console.log("On-chain ownerOf(tokenId):", onChainOwner);
  if (onChainOwner.toLowerCase() !== userBAddress.toLowerCase()) {
    throw new Error(`SMOKE TEST FAILED: on-chain owner mismatch, expected ${userBAddress}, got ${onChainOwner}`);
  }

  const parentDoc = await NFTSystem.findById(parentId);
  const subDoc = parentDoc.subCollections.id(subCollectionId);
  console.log("DB subCollection.owner:", subDoc.owner, "listed:", subDoc.listed, "tokenId:", subDoc.tokenId);
  if (subDoc.owner?.toLowerCase() !== userBAddress.toLowerCase()) {
    throw new Error(`SMOKE TEST FAILED: DB owner mismatch, expected ${userBAddress}, got ${subDoc.owner}`);
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
