import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
dotenv.config({ path: "./Config/.env" });

const RPC_URL = process.env.IMMUTABLE_RPC_URL || "https://rpc.testnet.immutable.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.IMMUTABLE_PRIVATE_KEY;
const MARKETPLACE_ADDRESS = "0x41E374A11391AfE9920c3c107CA8F578e34B6006";

// All previous MyNFT contract deployments used on the testnet
const NFT_ADDRESSES = [
  "0x6EBA209195530DbAC856f38E6A7EeaB2Ae4E24A0", // Original MyNFT
  "0x6663D00942E9F333B67431f7930a3f9DE2312aAA"  // Most recently deployed MyNFT
];

const MYNFT_ABI = [
  "function setMarketplaceAuthorization(address marketplace, bool authorized) external",
  "function isMarketplaceAuthorized(address marketplace) external view returns (bool)"
];

async function main() {
  console.log("Connecting to:", RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Deployer Wallet:", wallet.address);

  for (const nftAddress of NFT_ADDRESSES) {
    console.log(`\nChecking NFT Contract: ${nftAddress}`);
    const myNFT = new ethers.Contract(nftAddress, MYNFT_ABI, wallet);
    
    try {
        const isAuth = await myNFT.isMarketplaceAuthorized(MARKETPLACE_ADDRESS);
        if (isAuth) {
            console.log("✅ Already Authorized!");
        } else {
            console.log("🔐 Authorizing Marketplace...");
            const tx = await myNFT.setMarketplaceAuthorization(MARKETPLACE_ADDRESS, true);
            await tx.wait();
            console.log(`✅ Authorized! TX: ${tx.hash}`);
        }
    } catch (e) {
        console.error("❌ Failed to authorize:", e.message);
    }
  }
}

main().catch(console.error);
