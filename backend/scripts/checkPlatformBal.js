import { ethers } from "hardhat";

async function main() {
  const m = await ethers.getContractAt("Marketplace", "0x41E374A11391AfE9920c3c107CA8F578e34B6006");
  const wallet = await m.platformWallet();
  const bal = await m.platformBalance();
  console.log("PLATFORM WALLET: ", wallet);
  console.log("PLATFORM BALANCE: ", bal.toString());
}

main().catch(console.error);
