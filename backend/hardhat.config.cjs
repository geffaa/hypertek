require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./Config/.env" });

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
    immutableZkevmTestnet: {
      url: process.env.IMMUTABLE_RPC_URL || "https://rpc.testnet.immutable.com",
      accounts: process.env.IMMUTABLE_PRIVATE_KEY ? [process.env.IMMUTABLE_PRIVATE_KEY] : [],
    },
  },
};
