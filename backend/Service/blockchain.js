// Service/blockchain.js
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Point to backend/Config/.env from backend/Service/blockchain.js
dotenv.config({ path: path.join(__dirname, "../Config/.env") });

// ---------- ABI LOADER ----------
function loadABI(filename) {
  const possiblePaths = [
    path.join(__dirname, `../abis/${filename}`),
    path.join(__dirname, `../../abis/${filename}`),
    path.join(process.cwd(), `abis/${filename}`),
    path.join(process.cwd(), `backend/abis/${filename}`),
  ];

  for (const abiPath of possiblePaths) {
    if (fs.existsSync(abiPath)) {
      console.log(`✅ ${filename} loaded from: ${abiPath}`);
      return JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    }
  }

  throw new Error(`❌ ABI file not found: ${filename}`);
}

const MyNFTAbi = loadABI("MyNFT.json");
const MarketplaceAbi = loadABI("Marketplace.json");

// ---------- NETWORK CONFIGURATION ----------
const NETWORKS = {
  11155111: {
    name: "Sepolia",
    rpc: process.env.SEPOLIA_RPC_URL,
    privateKey: process.env.SEPOLIA_PRIVATE_KEY,
    nftAddress: process.env.SEPOLIA_NFT_ADDRESS || "0xC40f17FfF5591dbb12CD4279111C22bb33425244",
    marketAddress: process.env.SEPOLIA_MARKETPLACE_ADDRESS || "0x2E3Ae1bC661C170D009Cf3E9686dFFfF60AEDc0b",
  },
  13473: {
    name: "Immutable zkEVM Testnet",
    rpc: process.env.IMMUTABLE_RPC_URL,
    rpc: process.env.IMMUTABLE_RPC_URL,
    privateKey: process.env.IMMUTABLE_PRIVATE_KEY || process.env.PRIVATE_KEY || process.env.SEPOLIA_PRIVATE_KEY,
    nftAddress: process.env.IMMUTABLE_NFT_ADDRESS || process.env.MYNFT_ADDRESS,
    marketAddress: process.env.IMMUTABLE_MARKETPLACE_ADDRESS || process.env.MARKETPLACE_ADDRESS,
  },
};

// Cache for initialized providers/wallets/contracts
const instances = {};

function getBlockchain(chainId) {
  // Default to Immutable if not specified or unknown (or Sepolia if preferred default)
  const id = chainId || 13473; 
  const config = NETWORKS[id];

  if (!config) {
    throw new Error(`❌ Network configuration not found for Chain ID: ${id}`);
  }

  if (instances[id]) {
    return instances[id];
  }

  console.log(`🔌 Initializing connection for ${config.name} (${id})...`);

  if (!config.rpc || !config.privateKey) {
     throw new Error(`❌ Missing RPC or Private Key for ${config.name}`);
  }

  const provider = new ethers.JsonRpcProvider(config.rpc);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  const nftContract = new ethers.Contract(config.nftAddress, MyNFTAbi, wallet);
  const marketContract = new ethers.Contract(config.marketAddress, MarketplaceAbi, wallet);

  instances[id] = {
    provider,
    wallet,
    nftContract,
    marketContract,
    chainId: id
  };

  console.log(`✅ Initialized ${config.name}`);
  return instances[id];
}

// Initialize default (Immutable) on startup to catch errors early
try {
  getBlockchain(13473);
} catch (e) {
  console.error("⚠️ Failed to initialize default network:", e.message);
}

// ---------- HELPERS ----------
export function parseEther(value) {
  return ethers.parseEther(value.toString());
}

export function formatEther(value) {
  return ethers.formatEther(value);
}

export async function waitForTransaction(tx) {
  return await tx.wait();
}

// ---------- EXPORT ----------
export {
  getBlockchain,
  ethers,
  MyNFTAbi,
  MarketplaceAbi,
};
