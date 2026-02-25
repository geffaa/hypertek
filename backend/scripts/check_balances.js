import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const marketplaceAddress = "0xD40544ff822b29762cFE690b90261fD54A31386F";
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);

  try {
    const creatorAddress = "0x11Dd223303346021d21a72818c3188187eA07FD3";
    
    const pBalance = await marketplace.platformBalance();
    const cBalance = await marketplace.creatorBalance(creatorAddress);
    
    console.log("Platform Balance:", ethers.formatUnits(pBalance, 6), "USDC");
    console.log(`Creator Balance for ${creatorAddress}:`, ethers.formatUnits(cBalance, 6), "USDC");
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

main().catch(console.error);
