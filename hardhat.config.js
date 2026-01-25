// Hardhat configuration for TraceRoot smart contracts
// CommonJS for compatibility with Next.js ESM
// Ensure blockchain module uses mock mode during smart contract tests
process.env.USE_REAL_BLOCKCHAIN = 'false';

let hardhatConfig = {};

try {
  require('@nomicfoundation/hardhat-toolbox');
  require('dotenv').config();

  hardhatConfig = {
    solidity: {
      version: '0.8.19',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    networks: {
      hardhat: { chainId: 1337 },
      ganache: {
        url: 'http://127.0.0.1:8545',
        chainId: 1337,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
      },
      sepolia: {
        url: process.env.ETHEREUM_TESTNET_RPC_URL || '',
        chainId: 11155111,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 20000000000,
      },
      mainnet: {
        url: process.env.ETHEREUM_RPC_URL || '',
        chainId: 1,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 'auto',
      },
      mumbai: {
        url: process.env.POLYGON_TESTNET_RPC_URL || '',
        chainId: 80001,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 20000000000,
      },
      polygon: {
        url: process.env.POLYGON_RPC_URL || '',
        chainId: 137,
        accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
        gasPrice: 'auto',
      },
    },
    etherscan: {
      apiKey: {
        mainnet: process.env.ETHERSCAN_API_KEY || '',
        sepolia: process.env.ETHERSCAN_API_KEY || '',
        polygon: process.env.POLYGONSCAN_API_KEY || '',
        polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
      },
    },
    paths: {
      sources: './contracts',
      tests: './test/contracts',
      cache: './cache',
      artifacts: './artifacts',
    },
  };
} catch (err) {
  console.log('⚠️  Hardhat toolbox optional; compile/tests skipped if not installed.');
}

module.exports = hardhatConfig;
