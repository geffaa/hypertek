require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./Config/.env" });
// Mainnet deployer key lives in hardhat/.env (dotenv does not override already-set vars).
require("dotenv").config({ path: "../hardhat/.env" });

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.BASE_DEPLOYER_PRIVATE_KEY ? [process.env.BASE_DEPLOYER_PRIVATE_KEY] : [],
      chainId: 8453,
    },
  },
};
