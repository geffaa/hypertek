// One-time REAL mainnet proof: mint an NFT, list it, and have a second wallet buy it,
// all on Base MAINNET with REAL USDC, against the freshly-deployed contracts
// (deployment-mainnet.json). Proves the live marketplace + NFT contracts execute a genuine
// "seller lists -> buyer buys -> ownership moves to buyer" flow with real money.
// Tiny amounts (0.01 USDC). Uses the deployer wallet (has real USDC + ETH) as the seller,
// and a throwaway wallet as the buyer, funded with a sliver of ETH + USDC from the deployer.
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../../hardhat/.env") });

const RPC = "https://mainnet.base.org";
const MYNFT = "0x62a7939c1871f7CCBF50d1d4E66FDD89F0B72e88";
const MARKET = "0x51cB1c4Cc1435a154608f8Fad883AAa1587c0C21";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE = 10000n; // 0.01 USDC (6 decimals)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const seller = new ethers.Wallet(process.env.BASE_DEPLOYER_PRIVATE_KEY, provider);
  const buyer = ethers.Wallet.createRandom().connect(provider);

  console.log("Seller (deployer):", seller.address);
  console.log("Buyer (throwaway):", buyer.address);
  console.log("Buyer private key (for records):", buyer.privateKey);

  const nftAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/MyNFT.json"), "utf-8"));
  const marketAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/Marketplace.json"), "utf-8"));
  const usdcAbi = [
    "function transfer(address,uint256) returns (bool)",
    "function approve(address,uint256) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
  ];

  const nft = new ethers.Contract(MYNFT, nftAbi, seller);
  const market = new ethers.Contract(MARKET, marketAbi, seller);
  const usdc = new ethers.Contract(USDC, usdcAbi, seller);

  // Fund buyer with a sliver of ETH for gas + the exact USDC needed.
  console.log("\nFunding buyer with ETH for gas...");
  await (await seller.sendTransaction({ to: buyer.address, value: ethers.parseEther("0.0002") })).wait();
  await sleep(2000);
  console.log("Sending buyer 0.01 USDC...");
  await (await usdc.transfer(buyer.address, PRICE)).wait();
  await sleep(2000);

  // Seller mints an NFT to itself.
  console.log("\nMinting NFT on mainnet...");
  const mintTx = await nft.mint(seller.address, `ipfs://mainnet-proof-${Date.now()}`, 500);
  const mintReceipt = await mintTx.wait();
  const minted = mintReceipt.logs
    .map((l) => { try { return nft.interface.parseLog(l); } catch { return null; } })
    .find((e) => e?.name === "Minted");
  const tokenId = Number(minted.args.tokenId);
  console.log("Minted tokenId:", tokenId, "owner:", await nft.ownerOf(tokenId));
  await sleep(2000);

  // Seller approves + lists.
  console.log("\nApproving + listing at 0.01 USDC...");
  await (await nft.approve(MARKET, tokenId)).wait();
  await sleep(2000);
  await (await market.createListing(MYNFT, tokenId, PRICE)).wait();
  await sleep(2000);

  // Buyer approves USDC + buys.
  console.log("Buyer approving USDC + buying...");
  const usdcAsBuyer = usdc.connect(buyer);
  await (await usdcAsBuyer.approve(MARKET, PRICE)).wait();
  await sleep(2000);
  const marketAsBuyer = market.connect(buyer);
  const buyTx = await marketAsBuyer.buyNFT(MYNFT, tokenId);
  const buyReceipt = await buyTx.wait();
  console.log("Buy tx:", buyReceipt.hash);
  await sleep(2000);

  // Verify ownership moved to the buyer on-chain.
  const finalOwner = await nft.ownerOf(tokenId);
  console.log("\nFinal on-chain owner:", finalOwner);
  console.log("Expected (buyer):    ", buyer.address);
  if (finalOwner.toLowerCase() !== buyer.address.toLowerCase()) {
    throw new Error("PROOF FAILED: ownership did not transfer to buyer");
  }

  console.log("\n✅ MAINNET PROOF PASSED — real purchase, ownership moved to buyer on Base mainnet.");
  console.log("Mint tx:  https://basescan.org/tx/" + mintReceipt.hash);
  console.log("Buy tx:   https://basescan.org/tx/" + buyReceipt.hash);
  console.log("Token:    https://basescan.org/token/" + MYNFT + "?a=" + tokenId);
}

main().catch((err) => {
  console.error("\n❌ MAINNET PROOF ERROR:", err.message || err);
  process.exit(1);
});
