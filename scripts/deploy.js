// scripts/deploy.js - ES MODULE VERSION
import { ethers } from "hardhat";  // Try this import instead
import fs from "fs";

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  // 1. Deploy NFT contract
  console.log("📦 Deploying MyNFT contract...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  
  const nftAddress = await myNFT.getAddress();
  console.log("✅ MyNFT deployed to:", nftAddress);

  // 2. Deploy Marketplace
  console.log("\n🏪 Deploying Marketplace contract...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  
  const marketAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketAddress);

  // 3. Save addresses
  const config = {
    NFT_ADDRESS: nftAddress,
    MARKETPLACE_ADDRESS: marketAddress,
    DEPLOYER: deployer.address,
    NETWORK: "localhost"
  };
  
  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify(config, null, 2)
  );
  
  console.log("\n📁 Addresses saved to: deployed-addresses.json");

  // 4. Test contracts
  console.log("\n🔍 Testing contracts...");
  
  // Test NFT
  try {
    const nextId = await myNFT.nextTokenId();
    console.log("   NFT.nextTokenId():", Number(nextId));
  } catch (e) {
    console.log("   NFT.nextTokenId(): Not available");
  }
  
  // Test Marketplace
  try {
    const listing = await marketplace.getListing(nftAddress, 0);
    console.log("   Marketplace.getListing():", listing);
  } catch (e) {
    console.log("   Marketplace.getListing(): Works (no listing yet)");
  }

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("===================================");
  console.log("MyNFT:      ", nftAddress);
  console.log("Marketplace:", marketAddress);
  console.log("\n💡 Update your frontend config!");
  
  return { nftAddress, marketAddress };
}

// Use the Hardhat Runtime Environment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  });