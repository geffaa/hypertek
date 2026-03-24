// Deploy script for Base Sepolia Testnet
// Run: PRIVATE_KEY=0x... npx hardhat run scripts/deploy-testnet.cjs --network baseSepolia

const hre = require("hardhat");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  // Use PRIVATE_KEY from env directly — bypass hardhat signer to avoid nonce conflicts
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY env var not set");

  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer address:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH. Get testnet ETH from https://faucet.base.org");
  }

  // Load compiled artifacts from hardhat
  const MockUSDCArtifact = await hre.artifacts.readArtifact("MockUSDC");
  const MyNFTArtifact = await hre.artifacts.readArtifact("MyNFT");
  const MarketplaceArtifact = await hre.artifacts.readArtifact("Marketplace");

  // Track nonce manually to avoid ethers internal cache issues
  let nonce = await provider.getTransactionCount(wallet.address, "pending");
  console.log("Starting nonce:", nonce);

  // 1. Deploy MockUSDC
  console.log("\nDeploying MockUSDC...");
  const MockUSDCFactory = new ethers.ContractFactory(MockUSDCArtifact.abi, MockUSDCArtifact.bytecode, wallet);
  const mockUSDC = await MockUSDCFactory.deploy({ nonce: nonce++ });
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed:", await mockUSDC.getAddress());

  // 2. Deploy MyNFT
  console.log("\nDeploying MyNFT...");
  const MyNFTFactory = new ethers.ContractFactory(MyNFTArtifact.abi, MyNFTArtifact.bytecode, wallet);
  const myNFT = await MyNFTFactory.deploy({ nonce: nonce++ });
  await myNFT.waitForDeployment();
  console.log("MyNFT deployed:", await myNFT.getAddress());

  // 3. Deploy Marketplace
  console.log("\nDeploying Marketplace...");
  const MarketplaceFactory = new ethers.ContractFactory(MarketplaceArtifact.abi, MarketplaceArtifact.bytecode, wallet);
  const marketplace = await MarketplaceFactory.deploy(wallet.address, await mockUSDC.getAddress(), { nonce: nonce++ });
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed:", await marketplace.getAddress());

  // 4. Authorize marketplace in MyNFT
  console.log("\nAuthorizing marketplace in MyNFT...");
  const myNFTContract = new ethers.Contract(await myNFT.getAddress(), MyNFTArtifact.abi, wallet);
  const tx = await myNFTContract.setMarketplaceAuthorization(await marketplace.getAddress(), true, { nonce: nonce++ });
  await tx.wait();
  console.log("Marketplace authorized.");

  // 5. Save result
  const result = {
    network: "baseSepolia",
    deployer: wallet.address,
    contracts: {
      MockUSDC: await mockUSDC.getAddress(),
      MyNFT: await myNFT.getAddress(),
      Marketplace: await marketplace.getAddress(),
    },
    platformWallet: wallet.address,
    timestamp: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployment-testnet.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log("\nDeployment saved to deployment-testnet.json");

  console.log("\n=== UPDATE .env.testnet with these values ===");
  console.log(`VITE_CHAIN_ID=84532`);
  console.log(`VITE_MY_NFT_ADDRESS=${await myNFT.getAddress()}`);
  console.log(`VITE_MARKETPLACE_ADDRESS=${await marketplace.getAddress()}`);
  console.log(`VITE_USDC_ADDRESS=${await mockUSDC.getAddress()}`);
  console.log(`VITE_PLATFORM_WALLET=${wallet.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
