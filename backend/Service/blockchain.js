// Service/blockchain.js
import { ethers } from "ethers";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABIs with better error handling
function loadABI(filename) {
  const possiblePaths = [
    path.join(__dirname, `../abis/${filename}`),
    path.join(__dirname, `../../abis/${filename}`),
    path.join(process.cwd(), `abis/${filename}`),
    path.join(process.cwd(), `backend/abis/${filename}`)
  ];

  for (const abiPath of possiblePaths) {
    if (fs.existsSync(abiPath)) {
      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
      console.log(`✅ ${filename} loaded from: ${abiPath}`);
      return abi;
    }
  }

  console.warn(`⚠️  ${filename} not found. Please create the ABI file.`);
  return [];
}

const MyNFTAbi = loadABI('MyNFT.json');
const MarketplaceAbi = loadABI('Marketplace.json');

// Initialize provider and wallet
let provider, wallet, nftContract, marketContract;

try {
  if (!process.env.ALCHEMY_RPC_URL) {
    throw new Error('ALCHEMY_RPC_URL not found in environment variables');
  }

  provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
  console.log('✅ Provider initialized');

  if (process.env.DEPLOYER_PRIVATE_KEY) {
    wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    console.log('✅ Wallet initialized:', wallet.address);
  } else {
    console.warn('⚠️  DEPLOYER_PRIVATE_KEY not found.');
  }

  // Initialize NFT Contract
  if (process.env.MYNFT_ADDRESS && MyNFTAbi.length > 0 && wallet) {
    nftContract = new ethers.Contract(
      process.env.MYNFT_ADDRESS,
      MyNFTAbi,
      wallet
    );
    console.log('✅ NFT Contract initialized:', process.env.MYNFT_ADDRESS);
  }

  // Initialize Marketplace Contract
  if (process.env.MARKETPLACE_ADDRESS && MarketplaceAbi.length > 0 && wallet) {
    marketContract = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MarketplaceAbi,
      wallet
    );
    console.log('✅ Marketplace Contract initialized:', process.env.MARKETPLACE_ADDRESS);
  }

} catch (error) {
  console.error('❌ Blockchain initialization error:', error.message);
}

// Helper function to parse ETH to Wei
export function parseEther(ethAmount) {
  return ethers.parseEther(ethAmount.toString());
}

// Helper function to format Wei to ETH
export function formatEther(weiAmount) {
  return ethers.formatEther(weiAmount);
}

// Helper to get transaction receipt and extract events
export async function waitForTransaction(tx) {
  const receipt = await tx.wait();
  return receipt;
}

export {
  provider,
  wallet,
  nftContract,
  marketContract,
  ethers,
  MyNFTAbi,
  MarketplaceAbi
};