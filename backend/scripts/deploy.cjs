// scripts/deploy.js
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MyNFT
  console.log("Deploying MyNFT...");
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  const nftAddress = await myNFT.getAddress();
  console.log("✅ MyNFT deployed to:", nftAddress);

  // Deploy Marketplace
  console.log("\nDeploying Marketplace...");
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  console.log("Platform wallet:", platformWallet);
  
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(platformWallet);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // ⭐ CRITICAL: Authorize marketplace to call markAsSold
  console.log("\n🔐 Authorizing marketplace...");
  const authTx = await myNFT.setMarketplaceAuthorization(marketplaceAddress, true);
  await authTx.wait();
  console.log("✅ Marketplace authorized to mark NFTs as sold");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      MyNFT: nftAddress,
      Marketplace: marketplaceAddress
    },
    platformWallet: platformWallet,
    marketplaceAuthorized: true,
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, '../deployments.json');
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployments.json");

  // Save ABIs
  const abiDir = path.join(__dirname, '../backend/abis');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const nftArtifact = await hre.artifacts.readArtifact("MyNFT");
  const marketplaceArtifact = await hre.artifacts.readArtifact("Marketplace");

  fs.writeFileSync(
    path.join(abiDir, 'MyNFT.json'),
    JSON.stringify(nftArtifact.abi, null, 2)
  );

  fs.writeFileSync(
    path.join(abiDir, 'Marketplace.json'),
    JSON.stringify(marketplaceArtifact.abi, null, 2)
  );

  console.log("✅ ABIs saved to backend/abis/");

  // Copy ABIs to frontend
  const frontendAbiDir = path.join(__dirname, '../frontend/src/abis');
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }

  fs.copyFileSync(
    path.join(abiDir, 'MyNFT.json'),
    path.join(frontendAbiDir, 'MyNFT.json')
  );

  fs.copyFileSync(
    path.join(abiDir, 'Marketplace.json'),
    path.join(frontendAbiDir, 'Marketplace.json')
  );

  console.log("✅ ABIs copied to frontend/src/abis/");

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`MyNFT: ${nftAddress}`);
  console.log(`Marketplace: ${marketplaceAddress}`);
  console.log(`Platform Wallet: ${platformWallet}`);
  console.log(`Marketplace Authorized: ✅ YES`);
  console.log("=".repeat(60));

  console.log("\n📝 Update your .env files with these addresses:");
  console.log(`\nBackend .env:`);
  console.log(`MYNFT_ADDRESS=${nftAddress}`);
  console.log(`MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log(`PLATFORM_WALLET_ADDRESS=${platformWallet}`);
  
  console.log(`\nFrontend .env:`);
  console.log(`VITE_MYNFT_ADDRESS=${nftAddress}`);
  console.log(`VITE_MARKETPLACE_ADDRESS=${marketplaceAddress}`);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await myNFT.deploymentTransaction().wait(5);
    await marketplace.deploymentTransaction().wait(5);

    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [],
      });
      console.log("✅ MyNFT verified");
    } catch (e) {
      console.log("❌ MyNFT verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [platformWallet],
      });
      console.log("✅ Marketplace verified");
    } catch (e) {
      console.log("❌ Marketplace verification failed:", e.message);
    }
  }

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });