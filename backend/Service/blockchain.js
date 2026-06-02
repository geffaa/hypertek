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
      console.log(`${filename} loaded from: ${abiPath}`);
      return JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    }
  }

  throw new Error(` ABI file not found: ${filename}`);
}

const MyNFTAbi = loadABI("MyNFT.json");
const MarketplaceAbi = loadABI("Marketplace.json");

// ---------- NETWORK CONFIGURATION ----------
const NETWORKS = {
  8453: {
    name: "Base Mainnet",
    rpc: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    privateKey: process.env.PRIVATE_KEY,
    nftAddress: process.env.MYNFT_ADDRESS,
    marketAddress: process.env.MARKETPLACE_ADDRESS,
  },
  84532: {
    name: "Base Sepolia Testnet",
    rpc: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    privateKey: process.env.PRIVATE_KEY,
    nftAddress: process.env.MYNFT_ADDRESS,
    marketAddress: process.env.MARKETPLACE_ADDRESS,
  },
};

// Cache for initialized providers/wallets/contracts
const instances = {};

function getBlockchain(chainId) {
  // Default to Base Mainnet if not specified or unknown
  const id = chainId || parseInt(process.env.BASE_CHAIN_ID) || 8453;
  const config = NETWORKS[id];

  if (!config) {
    throw new Error(` Network configuration not found for Chain ID: ${id}`);
  }

  if (instances[id]) {
    return instances[id];
  }

  console.log(`Initializing connection for ${config.name} (${id})...`);

  if (!config.rpc || !config.privateKey) {
    throw new Error(` Missing RPC or Private Key for ${config.name}`);
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

  console.log(`Initialized ${config.name}`);
  return instances[id];
}

// Initialize default (Base Mainnet) on startup to catch errors early
try {
  getBlockchain(parseInt(process.env.BASE_CHAIN_ID) || 8453);
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
