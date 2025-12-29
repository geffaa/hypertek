const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Get balance - ethers v6 syntax (no hre, no utils)
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy MyNFT
  console.log("\n📦 Deploying MyNFT...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment(); // v6: waitForDeployment (not .deployed())
  
  const nftAddress = await myNFT.getAddress(); // v6: getAddress() (not .address)
  console.log("✅ MyNFT deployed to:", nftAddress);

  // Deploy Marketplace
  console.log("\n📦 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address);
  await marketplace.waitForDeployment(); // v6: waitForDeployment
  
  const marketplaceAddress = await marketplace.getAddress(); // v6: getAddress()
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  console.log("\n🎉 Deployment Complete!");
  console.log("=====================================");
  console.log("NFT Contract:", nftAddress);
  console.log("Marketplace Contract:", marketplaceAddress);
  console.log("=====================================");
  console.log("\n📋 Copy these addresses to your frontend Config.js:");
  console.log(`export const NFT_ADDRESS = "${nftAddress}";`);
  console.log(`export const MARKETPLACE_ADDRESS = "${marketplaceAddress}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });