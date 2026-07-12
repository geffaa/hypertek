// One-time smoke test (Phase D): prove the new on-chain verification code
// (services/marketplaceSyncService.js) works against a REAL deployed network via the real
// getBlockchain() RPC path — not just the local ephemeral Hardhat test. Runs on Base Sepolia
// testnet only. Not a permanent feature/endpoint — a manual verification pass before trusting
// this code with mainnet traffic.
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../Config/.env") });

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const buyer = ethers.Wallet.createRandom().connect(provider);

  console.log("Deployer (minter/seller):", deployer.address);
  console.log("Fresh buyer wallet:", buyer.address);

  const MyNFTAbi = JSON.parse(require("fs").readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const MarketplaceAbi = JSON.parse(require("fs").readFileSync(path.join(__dirname, "../abis/Marketplace.json"), "utf-8"));
  const usdcAbi = [
    "function mint(address to, uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
  ];

  const nft = new ethers.Contract(process.env.MYNFT_ADDRESS, MyNFTAbi, deployer);
  const market = new ethers.Contract(process.env.MARKETPLACE_ADDRESS, MarketplaceAbi, deployer);
  const usdc = new ethers.Contract(process.env.BASE_USDC_ADDRESS, usdcAbi, deployer);

  // Fund the fresh buyer wallet with a small amount of testnet ETH for gas.
  console.log("\nFunding buyer with testnet ETH for gas...");
  const fundTx = await deployer.sendTransaction({ to: buyer.address, value: ethers.parseEther("0.000005") });
  await fundTx.wait();

  console.log("Minting NFT (deployer as creator/seller)...");
  const mintTx = await nft.mint(deployer.address, "ipfs://smoke-test-token", 500);
  const mintReceipt = await mintTx.wait();
  const mintedEvent = mintReceipt.logs
    .map((l) => { try { return nft.interface.parseLog(l); } catch { return null; } })
    .find((e) => e?.name === "Minted");
  const tokenId = Number(mintedEvent.args.tokenId);
  console.log("Minted tokenId:", tokenId);

  const price = 100000n; // 0.1 USDC (6 decimals) — keep it tiny, this is a real testnet asset

  console.log("Minting test USDC to buyer...");
  await (await usdc.mint(buyer.address, price)).wait();

  console.log("Approving + listing NFT...");
  await (await nft.approve(await market.getAddress(), tokenId)).wait();
  await (await market.createListing(await nft.getAddress(), tokenId, price)).wait();

  console.log("Buyer approving USDC + buying...");
  const usdcAsBuyer = usdc.connect(buyer);
  await (await usdcAsBuyer.approve(await market.getAddress(), price)).wait();
  const marketAsBuyer = market.connect(buyer);
  const buyTx = await marketAsBuyer.buyNFT(await nft.getAddress(), tokenId);
  const buyReceipt = await buyTx.wait();
  console.log("Purchase tx:", buyReceipt.hash, "block:", buyReceipt.blockNumber);

  // Now run the ACTUAL Phase B code against this real transaction.
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
