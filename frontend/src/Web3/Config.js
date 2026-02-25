// src/Web3/Config.js

// ✅ Addresses from your deployment

// Immutable zkEVM Testnet
export const IMMUTABLE_NFT_ADDRESS = "0x70A6f0EFE23aD7f3dC981b1517D6637E13462dBb";
export const IMMUTABLE_MARKETPLACE_ADDRESS = "0xD40544ff822b29762cFE690b90261fD54A31386F";

// USDC Addresses (Testnet Placeholders - Replace with actual if different)
export const IMMUTABLE_USDC_ADDRESS = "0x595BdF23a1e9B945e18ffBe4316572ACCC694aDE"; // Mock USDC for Testing

export const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Default exports (Used as fallback or legacy)
export const NFT_ADDRESS = IMMUTABLE_NFT_ADDRESS; 
export const MARKETPLACE_ADDRESS = IMMUTABLE_MARKETPLACE_ADDRESS;

// ✅ CHAIN IDs
export const IMMUTABLE_CHAIN_ID = 13473;
export const PLATFORM_WALLET_ADDRESS = "0x11Dd223303346021d21a72818c3188187eA07FD3";

// ---------------- NFT ABI ----------------
export const NFT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "uint16", "name": "royaltyBps", "type": "uint16" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getApproved",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "operator", "type": "address" }
    ],
    "name": "isApprovedForAll",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// ---------------- Marketplace ABI ----------------
export const MARKETPLACE_ABI = [
  {"inputs":[{"internalType":"address","name":"_platformWallet","type":"address"},{"internalType":"address","name":"_usdcAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"nftAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ListingCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"nftAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ListingCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"nftAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"creatorAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"platformAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"sellerAmount","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isFirstSale","type":"bool"}],"name":"NFTSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FirstSaleDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"role","type":"string"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"PLATFORM_FEE_BPS","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"nftAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"buyNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nftAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"cancelListing","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nftAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"createListing","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creatorBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositFirstSalePayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nftAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getListing","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"listings","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"sellerBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newWallet","type":"address"}],"name":"updatePlatformWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdc","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawPlatformFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawSeller","outputs":[],"stateMutability":"nonpayable","type":"function"}
];