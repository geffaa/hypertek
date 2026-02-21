import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MockUSDC with account:", deployer.address);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const address = await usdc.getAddress();

  console.log("✅ MockUSDC Deployed at:", address);

  // Mint to the user's wallet
  const TARGET = "0x985fe3400ff5b035440489e61561bab22a025b6f";
  console.log(`Minting 20,000 USDC to ${TARGET}...`);
  const tx = await usdc.mint(TARGET, ethers.parseUnits("20000", 6));
  await tx.wait();
  
  console.log("✅ Minted to target wallet!");
}

main().catch(console.error);
