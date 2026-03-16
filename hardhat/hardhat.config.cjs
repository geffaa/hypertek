require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.BASE_DEPLOYER_PRIVATE_KEY ? [process.env.BASE_DEPLOYER_PRIVATE_KEY] : [],
      chainId: 8453,
    },
    immutableZkevmTestnet: {
      url: process.env.IMMUTABLE_RPC_URL || "https://rpc.testnet.immutable.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 13473,
    },
  },
};
