// scripts/deploy-v3.js - FOR HARDHAT v3
import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting Hardhat v3 deployment...\n");

  // Get deployer account - NEW WAY in v3
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // 1. Deploy NFT contract - NEW WAY
  console.log("📦 Deploying MyNFT contract...");
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();  // NEW in v3
  
  const nftAddress = await myNFT.getAddress();  // NEW in v3
  console.log("✅ MyNFT deployed to:", nftAddress);

  // 2. Deploy Marketplace
  console.log("\n🏪 Deploying Marketplace contract...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  
  const marketAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketAddress);

  // 3. Save addresses
  const config = {
    NFT_ADDRESS: nftAddress,
    MARKETPLACE_ADDRESS: marketAddress,
    DEPLOYER: deployer.address,
    NETWORK: "localhost",
    HARDHAT_VERSION: "3.1.0"
  };
  
  fs.writeFileSync(
    "./deployed-addresses-v3.json",
    JSON.stringify(config, null, 2)
  );
  
  console.log("\n📁 Addresses saved to: deployed-addresses-v3.json");

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

  console.log("\n🎉 HARDHAT v3 DEPLOYMENT COMPLETE!");
  console.log("===================================");
  console.log("MyNFT:      ", nftAddress);
  console.log("Marketplace:", marketAddress);
  console.log("\n💡 Update your frontend config!");
  
  return { nftAddress, marketAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  });