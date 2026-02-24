// scripts/deploy.js
import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ========================================
  // 1. Deploy MyNFT Contract
  // ========================================
  console.log("📦 Deploying MyNFT contract...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  const myNFTAddress = await myNFT.getAddress();
  console.log("✅ MyNFT deployed to:", myNFTAddress);

  // ========================================
  // 2. Deploy Marketplace Contract
  // ========================================
  console.log("\n📦 Deploying Marketplace contract...");
  const usdcAddress = process.env.IMMUTABLE_USDC_ADDRESS || "0x595BdF23a1e9B945e18ffBe4316572ACCC694aDE"; // Mock USDC for Testing
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address, usdcAddress); // Platform wallet, USDC address
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // ========================================
  // 3. ✅ CRITICAL: Authorize Marketplace in MyNFT
  // ========================================
  console.log("\n🔐 Authorizing Marketplace to mark sales...");
  const authTx = await myNFT.setMarketplaceAuthorization(marketplaceAddress, true);
  await authTx.wait();
  console.log("✅ Marketplace authorized successfully!");

  // Verify authorization
  const isAuthorized = await myNFT.isMarketplaceAuthorized(marketplaceAddress);
  console.log("🔍 Marketplace authorization status:", isAuthorized);

  // ========================================
  // 4. Save Deployment Info
  // ========================================
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    contracts: {
      MyNFT: myNFTAddress,
      Marketplace: marketplaceAddress,
    },
    platformWallet: deployer.address,
    marketplaceAuthorized: isAuthorized,
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // ========================================
  // 5. Save ABIs
  // ========================================
  console.log("\n📝 Saving contract ABIs...");
  const abisDir = path.join(__dirname, "../abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  // Get artifacts
  const myNFTArtifact = await ethers.getContractFactory("MyNFT");
  const marketplaceArtifact = await ethers.getContractFactory("Marketplace");

  // Save ABIs
  fs.writeFileSync(
    path.join(abisDir, "MyNFT.json"),
    JSON.stringify(myNFTArtifact.interface.formatJson(), null, 2)
  );
  fs.writeFileSync(
    path.join(abisDir, "Marketplace.json"),
    JSON.stringify(marketplaceArtifact.interface.formatJson(), null, 2)
  );
  console.log("✅ ABIs saved to:", abisDir);

  // ========================================
  // 6. Update .env file
  // ========================================
  console.log("\n📝 Updating .env file...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  // Update or add contract addresses
  const updateEnv = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  updateEnv("MYNFT_ADDRESS", myNFTAddress);
  updateEnv("MARKETPLACE_ADDRESS", marketplaceAddress);
  updateEnv("PLATFORM_WALLET_ADDRESS", deployer.address);

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated");

  // ========================================
  // 7. Summary
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   MyNFT:       ", myNFTAddress);
  console.log("   Marketplace: ", marketplaceAddress);
  console.log("\n🔐 Authorization:");
  console.log("   Marketplace is authorized:", isAuthorized ? "✅ YES" : "❌ NO");
  console.log("\n💼 Platform Wallet:", deployer.address);
  console.log("\n📝 Next Steps:");
  console.log("   1. Update your frontend with these addresses");
  console.log("   2. Restart your backend server");
  console.log("   3. Test minting and listing");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });