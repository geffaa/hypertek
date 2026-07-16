// Continuation of mainnet-live-proof.cjs: token 1 is already minted to the seller and the
// buyer is already funded (confirmed on-chain). The original run only died on an immediate
// ownerOf() read hitting a lagging mainnet RPC node. Resume: seller lists token 1, buyer buys,
// verify ownership moved — with a retry loop around chain reads to tolerate RPC lag.
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../../hardhat/.env") });

const RPC = "https://mainnet.base.org";
const MYNFT = "0x62a7939c1871f7CCBF50d1d4E66FDD89F0B72e88";
const MARKET = "0x51cB1c4Cc1435a154608f8Fad883AAa1587c0C21";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE = 10000n; // 0.01 USDC
const TOKEN_ID = 1;
const BUYER_PK = "0x12e7634f85fa7912b62c40dd08d77229987b3c2e52f050ec8975309de7846f03";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ownerOfRetry(nft, tokenId, tries = 15) {
  for (let i = 0; i < tries; i++) {
    try { return await nft.ownerOf(tokenId); }
    catch { await sleep(3000); }
  }
  throw new Error("ownerOf still failing after retries");
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const seller = new ethers.Wallet(process.env.BASE_DEPLOYER_PRIVATE_KEY, provider);
  const buyer = new ethers.Wallet(BUYER_PK, provider);

  const nftAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const marketAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/Marketplace.json"), "utf-8"));
  const usdcAbi = ["function approve(address,uint256) returns (bool)"];

  const nft = new ethers.Contract(MYNFT, nftAbi, seller);
  const market = new ethers.Contract(MARKET, marketAbi, seller);

  console.log("Seller:", seller.address, "| Buyer:", buyer.address);
  console.log("Starting owner of token", TOKEN_ID, ":", await ownerOfRetry(nft, TOKEN_ID));

  console.log("\nApproving NFT for marketplace...");
  await (await nft.approve(MARKET, TOKEN_ID)).wait();
  await sleep(3000);
  console.log("Listing at 0.01 USDC...");
  await (await market.createListing(MYNFT, TOKEN_ID, PRICE)).wait();
  await sleep(3000);

  console.log("Buyer approving USDC...");
  const usdcAsBuyer = new ethers.Contract(USDC, usdcAbi, buyer);
  await (await usdcAsBuyer.approve(MARKET, PRICE)).wait();
  await sleep(4000);

  console.log("Buyer buying...");
  const marketAsBuyer = market.connect(buyer);
  const buyReceipt = await (await marketAsBuyer.buyNFT(MYNFT, TOKEN_ID)).wait();
  console.log("Buy tx:", buyReceipt.hash);
  await sleep(3000);

  const finalOwner = await ownerOfRetry(nft, TOKEN_ID);
  console.log("\nFinal on-chain owner:", finalOwner);
  console.log("Expected (buyer):    ", buyer.address);
  if (finalOwner.toLowerCase() !== buyer.address.toLowerCase()) {
    throw new Error("PROOF FAILED: ownership did not transfer to buyer");
  }

  console.log("\n✅ MAINNET PROOF PASSED — real 0.01 USDC purchase, ownership moved to buyer on Base mainnet.");
  console.log("Buy tx:  https://basescan.org/tx/" + buyReceipt.hash);
  console.log("Token:   https://basescan.org/token/" + MYNFT + "?a=" + TOKEN_ID);
}

main().catch((err) => {
  console.error("\n❌ MAINNET PROOF ERROR:", err.message || err);
  process.exit(1);
});
