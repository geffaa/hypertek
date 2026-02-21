import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
dotenv.config({ path: "./Config/.env" });

const RPC_URL = process.env.IMMUTABLE_RPC_URL || "https://rpc.testnet.immutable.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.IMMUTABLE_PRIVATE_KEY;
const TARGET_ADDRESS = "0x985fe3400ff5b035440489e61561bab22a025b6f";
const USDC_ADDRESS = "0x3B2d8A1931736Fc321C24864BceEe981B11c3c57"; 

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)"
];

async function main() {
  console.log("Connecting to:", RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  if (!PRIVATE_KEY) {
    console.error("❌ No PRIVATE_KEY found in .env files");
    return;
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Deployer Wallet:", wallet.address);
  
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
  
  const balance = await usdc.balanceOf(wallet.address);
  const decimals = await usdc.decimals();
  console.log(`USDC Balance of deployer: ${ethers.formatUnits(balance, decimals)} USDC`);
  
  if (balance > 0) {
      console.log(`Transferring 1000 USDC to ${TARGET_ADDRESS}...`);
      const tx = await usdc.transfer(TARGET_ADDRESS, ethers.parseUnits("1000", decimals));
      await tx.wait();
      console.log(`✅ Transfer successful! TX: ${tx.hash}`);
  } else {
      console.log("❌ Deployer wallet has 0 USDC. Checking if we can call mint()...");
      try {
          // Some testnets have an open mint function on their mock USDC
          const tx = await usdc.mint(wallet.address, ethers.parseUnits("10000", decimals));
          await tx.wait();
          console.log(`✅ Mint successful! TX: ${tx.hash}`);
          
          const tx2 = await usdc.transfer(TARGET_ADDRESS, ethers.parseUnits("1000", decimals));
          await tx2.wait();
          console.log(`✅ Transfer successful! TX: ${tx2.hash}`);
      } catch (e) {
         console.error("❌ Mint failed, likely restricted:", e.message); 
      }
  }
}

main().catch(console.error);
