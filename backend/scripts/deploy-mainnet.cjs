// Deploy script for Base Mainnet — fresh MyNFT + Marketplace (10% platform fee), matching
// the already-tested backend/contracts/Marketplace.sol, using the REAL Base USDC token.
// Supersedes the old hardhat/contracts/Marketplace.sol deployment (20% fee, 0xfA9AFd...),
// which is left untouched for provenance only — not used by this deploy.
// Run: npx hardhat run scripts/deploy-mainnet.cjs --network base
const hre = require("hardhat");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const REAL_BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("BASE_DEPLOYER_PRIVATE_KEY env var not set");

  const platformWallet = process.env.BASE_PLATFORM_WALLET;
  if (!platformWallet) throw new Error("BASE_PLATFORM_WALLET env var not set");

  const provider = new ethers.JsonRpcProvider(process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org");
  const wallet = new ethers.Wallet(privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer address:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Platform wallet:", platformWallet);
  console.log("USDC (real, Base mainnet):", REAL_BASE_USDC);

  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH on Base mainnet.");
  }

  const MyNFTArtifact = await hre.artifacts.readArtifact("MyNFT");
  const MarketplaceArtifact = await hre.artifacts.readArtifact("Marketplace");

  let nonce = await provider.getTransactionCount(wallet.address, "pending");
  console.log("Starting nonce:", nonce);

  console.log("\nDeploying MyNFT...");
  const MyNFTFactory = new ethers.ContractFactory(MyNFTArtifact.abi, MyNFTArtifact.bytecode, wallet);
  const myNFT = await MyNFTFactory.deploy({ nonce: nonce++ });
  await myNFT.waitForDeployment();
  console.log("MyNFT deployed:", await myNFT.getAddress());

  console.log("\nDeploying Marketplace (10% platform fee)...");
  const MarketplaceFactory = new ethers.ContractFactory(MarketplaceArtifact.abi, MarketplaceArtifact.bytecode, wallet);
  const marketplace = await MarketplaceFactory.deploy(platformWallet, REAL_BASE_USDC, { nonce: nonce++ });
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed:", await marketplace.getAddress());

  console.log("\nAuthorizing marketplace in MyNFT...");
  const myNFTContract = new ethers.Contract(await myNFT.getAddress(), MyNFTArtifact.abi, wallet);
  const tx = await myNFTContract.setMarketplaceAuthorization(await marketplace.getAddress(), true, { nonce: nonce++ });
  await tx.wait();
  console.log("Marketplace authorized.");

  const feeBps = await marketplace.PLATFORM_FEE_BPS();
  console.log("Confirmed on-chain PLATFORM_FEE_BPS:", feeBps.toString());

  const result = {
    network: "base",
    deployer: wallet.address,
    contracts: {
      MyNFT: await myNFT.getAddress(),
      Marketplace: await marketplace.getAddress(),
    },
    usdc: REAL_BASE_USDC,
    platformWallet,
    platformFeeBps: Number(feeBps),
    marketplaceAuthorized: true,
    supersedes: {
      note: "Replaces the old hardhat/contracts/Marketplace.sol deployment (20% fee)",
      oldMarketplace: "0xfA9AFd6A073Da44bDDb4B7f3C396A39c782cC9df",
    },
    timestamp: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployment-mainnet.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log("\nDeployment saved to deployment-mainnet.json");

  console.log("\n=== UPDATE .env.production with these values ===");
  console.log(`VITE_CHAIN_ID=8453`);
  console.log(`VITE_MY_NFT_ADDRESS=${await myNFT.getAddress()}`);
  console.log(`VITE_MARKETPLACE_ADDRESS=${await marketplace.getAddress()}`);
  console.log(`VITE_USDC_ADDRESS=${REAL_BASE_USDC}`);
  console.log(`VITE_PLATFORM_WALLET=${platformWallet}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
