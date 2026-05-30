require("dotenv").config({ path: "./Config/.env" });
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const marketplaceAddress = "0x41E374A11391AfE9920c3c107CA8F578e34B6006";
  console.log("Checking contract at:", marketplaceAddress);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);

  try {
    // We just want to see if the function exists on the contract ABI and can be estimated.
    // If the function is not on-chain, estimateGas or call static will revert with "function selector not found" or similar.
    // We will simulate a call that will fail for other reasons (e.g. amount=0 or invalid sender) but NOT due to missing signature.

    await marketplace.depositFirstSalePayment.staticCall(ethers.ZeroAddress, 0);
    console.log("Function exists on-chain! (Reverted for other reasons, but signature exists)");
  } catch (err) {
    if (err.message.includes("is not a function") || err.message.includes("Transaction reverted without a reason") || err.message.includes("execution reverted") || err.message.includes("revert")) {
      console.log("Error details:", err.message);
      // Wait, staticCall will revert with "Amount must be greater than 0" if the function exists.
      if (err.message.includes("Amount must be greater than 0")) {
        console.log("EXACT MATCH: Function exists and requires amount > 0!");
      } else {
        console.log("Function check result:", err.message);
      }
    } else {
      console.error(err);
    }
  }
}

main().catch(console.error);
