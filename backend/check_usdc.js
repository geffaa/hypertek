
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../backend/Config/.env") });

const RPC_URL = "https://rpc.testnet.immutable.com";
const MARKETPLACE_ADDRESS = "0x41E374A11391AfE9920c3c107CA8F578e34B6006";

const MARKETPLACE_ABI = [
  "function usdc() view returns (address)"
];

async function checkUSDC() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
    const usdcAddr = await contract.usdc();
    console.log("CONTRACT_USDC_ADDRESS=" + usdcAddr);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkUSDC();
