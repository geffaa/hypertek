// Continuation of smoke-test-reconcile.cjs: tokenId 13 was already minted+approved (confirmed
// on-chain via getApproved). Public RPC replication lag caused the previous run's createListing
// estimateGas to hit a stale node right after approve — retry with small delays between
// state-dependent calls.
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../Config/.env") });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const buyer = ethers.Wallet.createRandom().connect(provider);
  const tokenId = 13;
  const price = 100000n; // 0.1 USDC

  console.log("Deployer (seller):", deployer.address);
  console.log("Fresh buyer wallet:", buyer.address);

  const fs = require("fs");
  const MyNFTAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const MarketplaceAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/Marketplace.json"), "utf-8"));
  const usdcAbi = [
    "function mint(address to, uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
  ];

  const nft = new ethers.Contract(process.env.MYNFT_ADDRESS, MyNFTAbi, deployer);
  const market = new ethers.Contract(process.env.MARKETPLACE_ADDRESS, MarketplaceAbi, deployer);
  const usdc = new ethers.Contract(process.env.BASE_USDC_ADDRESS, usdcAbi, deployer);

  console.log("\nFunding buyer with testnet ETH for gas...");
  await (await deployer.sendTransaction({ to: buyer.address, value: ethers.parseEther("0.000005") })).wait();
  await sleep(3000);

  console.log("Minting test USDC to buyer...");
  await (await usdc.mint(buyer.address, price)).wait();
  await sleep(3000);

  console.log("Creating listing (approval already confirmed on-chain)...");
  await (await market.createListing(await nft.getAddress(), tokenId, price)).wait();
  await sleep(3000);

  console.log("Buyer approving USDC...");
  const usdcAsBuyer = usdc.connect(buyer);
  await (await usdcAsBuyer.approve(await market.getAddress(), price)).wait();
  await sleep(3000);

  console.log("Buyer buying...");
  const marketAsBuyer = market.connect(buyer);
  const buyTx = await marketAsBuyer.buyNFT(await nft.getAddress(), tokenId);
  const buyReceipt = await buyTx.wait();
  console.log("Purchase tx:", buyReceipt.hash, "block:", buyReceipt.blockNumber);

  await sleep(3000);

  const { verifySaleOnChain, findUnprocessedSales } = await import("../services/marketplaceSyncService.js");

  console.log("\n--- Testing verifySaleOnChain() against the real tx ---");
  const verification = await verifySaleOnChain({
    chainId: 84532,
    tokenId,
    buyer: buyer.address,
    seller: deployer.address,
    txHash: buyReceipt.hash,
  });
  console.log(JSON.stringify(verification, null, 2));

  if (!verification.verified) throw new Error("SMOKE TEST FAILED: verifySaleOnChain did not verify a real sale");
  if (verification.event.buyer.toLowerCase() !== buyer.address.toLowerCase()) throw new Error("SMOKE TEST FAILED: buyer mismatch");
  if (verification.event.priceUSDC !== 0.1) throw new Error(`SMOKE TEST FAILED: price mismatch, got ${verification.event.priceUSDC}`);

  console.log("\n--- Testing findUnprocessedSales() (reconcile query path) ---");
  const unprocessed = await findUnprocessedSales({
    chainId: 84532,
    fromBlock: buyReceipt.blockNumber - 5,
    toBlock: buyReceipt.blockNumber,
    alreadyRecordedTxHashes: [],
  });
  const found = unprocessed.find((s) => s.txHash === buyReceipt.hash);
  if (!found) throw new Error("SMOKE TEST FAILED: findUnprocessedSales did not find the real sale");
  console.log("Found via queryFilter:", JSON.stringify(found, null, 2));

  console.log("\n✅ SMOKE TEST PASSED — on-chain verification code works correctly against a real deployed network.");
}

main().catch((err) => {
  console.error("\n❌ SMOKE TEST ERROR:", err);
  process.exit(1);
});
