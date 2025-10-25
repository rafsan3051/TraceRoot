// Hardhat configuration for TraceRoot smart contracts
// Only load if hardhat is installed
let hardhatConfig;

try {
  require("@nomicfoundation/hardhat-toolbox");
  require("dotenv").config();

  hardhatConfig = {
    solidity: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    networks: {
      // Local development network
      hardhat: {
        chainId: 1337,
      },
      
      // Ganache local network
      ganache: {
        url: "http://127.0.0.1:8545",
        chainId: 1337,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
      },
      
      // Ethereum Sepolia testnet
      sepolia: {
        url: process.env.ETHEREUM_TESTNET_RPC_URL || "",
        chainId: 11155111,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 20000000000, // 20 Gwei
      },
      
      // Ethereum mainnet
      mainnet: {
        url: process.env.ETHEREUM_RPC_URL || "",
        chainId: 1,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: "auto",
      },
      
      // Polygon Mumbai testnet
      mumbai: {
        url: process.env.POLYGON_TESTNET_RPC_URL || "",
        chainId: 80001,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 20000000000, // 20 Gwei
      },
      
      // Polygon mainnet
      polygon: {
        url: process.env.POLYGON_RPC_URL || "",
        chainId: 137,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: "auto",
      },
    },
    etherscan: {
      // Get API key from https://etherscan.io/
      apiKey: {
        mainnet: process.env.ETHERSCAN_API_KEY || "",
        sepolia: process.env.ETHERSCAN_API_KEY || "",
        polygon: process.env.POLYGONSCAN_API_KEY || "",
        polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      },
    },
    paths: {
      sources: "./contracts",
      tests: "./test/contracts",
      cache: "./cache",
      artifacts: "./artifacts",
    },
  };
} catch (error) {
  // Hardhat not installed - provide dummy config
  console.log('ℹ️  Hardhat not installed. Install with: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox');
  hardhatConfig = {};
}

module.exports = hardhatConfig;
