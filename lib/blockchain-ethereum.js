/**
 * Ethereum/Sepolia Blockchain Integration
 * 
 * This module handles interaction with Ethereum-based networks (Sepolia testnet)
 * using ethers.js v6
 */

import { ethers } from 'ethers';

// Contract ABIs (we'll import from artifacts)
import ProductRegistryArtifact from '../artifacts/contracts/ProductRegistry.sol/ProductRegistry.json' assert { type: 'json' };
import SupplyChainArtifact from '../artifacts/contracts/SupplyChain.sol/SupplyChain.json' assert { type: 'json' };

// Helper to check if we should use real blockchain
function isRealBlockchain() {
  return process.env.USE_REAL_BLOCKCHAIN === 'true';
}

// Mock transaction ID generator
function mockTx(prefix = 'mock_tx') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Get provider (RPC connection)
function getProvider() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.ETHEREUM_TESTNET_RPC_URL;
  
  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL not configured. Get one from https://www.alchemy.com/');
  }
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Get signer (for transactions)
function getSigner() {
  const privateKey = process.env.PRIVATE_KEY || process.env.BLOCKCHAIN_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured');
  }
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

// Get contract instances
function getContracts() {
  const signer = getSigner();
  
  const productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  const supplyChainAddress = process.env.SUPPLY_CHAIN_ADDRESS;
  
  if (!productRegistryAddress || !supplyChainAddress) {
    throw new Error('Contract addresses not configured. Deploy contracts first.');
  }
  
  const productRegistry = new ethers.Contract(
    productRegistryAddress,
    ProductRegistryArtifact.abi,
    signer
  );
  
  const supplyChain = new ethers.Contract(
    supplyChainAddress,
    SupplyChainArtifact.abi,
    signer
  );
  
  return { productRegistry, supplyChain };
}

/**
 * Record a product to blockchain
 */
export async function recordToBlockchain(data) {
  if (!isRealBlockchain()) {
    console.log('📝 Mock Blockchain Record:', data);
    return mockTx();
  }

  try {
    const { productRegistry, supplyChain } = getContracts();
    
    // Register product in ProductRegistry
    const tx1 = await productRegistry.registerProduct(
      data.id || `PROD-${Date.now()}`,
      data.name || 'Unnamed Product',
      data.origin || 'Unknown',
      data.category || 'General'
    );
    
    console.log('⏳ Registering product on blockchain...');
    const receipt1 = await tx1.wait();
    console.log('✅ Product registered:', receipt1.hash);
    
    // Create product in SupplyChain
    const tx2 = await supplyChain.createProduct(
      data.id || `PROD-${Date.now()}`,
      data.location || 'Origin',
      JSON.stringify({ timestamp: new Date().toISOString(), ...data })
    );
    
    console.log('⏳ Creating supply chain entry...');
    const receipt2 = await tx2.wait();
    console.log('✅ Supply chain entry created:', receipt2.hash);
    
    // Return the main transaction hash
    return receipt1.hash;
    
  } catch (error) {
    console.error('❌ Blockchain error:', error.message);
    
    // Fallback to mock in case of error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    console.log('⚠️ Falling back to mock transaction');
    return mockTx('fallback_tx');
  }
}

/**
 * Verify blockchain transaction
 */
export async function verifyBlockchainData(txHash) {
  if (!isRealBlockchain()) {
    return {
      verified: true,
      timestamp: new Date().toISOString(),
      data: { txHash, status: 'confirmed (mock)' }
    };
  }

  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return {
        verified: false,
        error: 'Transaction not found'
      };
    }
    
    const block = await provider.getBlock(receipt.blockNumber);
    
    return {
      verified: receipt.status === 1,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      blockNumber: receipt.blockNumber,
      network: 'Sepolia Testnet',
      explorer: `https://sepolia.etherscan.io/tx/${txHash}`,
      data: {
        txHash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        gasUsed: receipt.gasUsed.toString()
      }
    };
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return {
      verified: false,
      error: error.message
    };
  }
}

/**
 * Get blockchain history for a product
 */
export async function getBlockchainHistory(productId) {
  if (!isRealBlockchain()) {
    return [
      {
        txHash: mockTx(),
        timestamp: new Date().toISOString(),
        type: 'CREATION',
        actor: 'System',
        data: { productId, action: 'Product Registered' }
      },
      {
        txHash: mockTx(),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'TRANSFER',
        actor: 'Distributor',
        data: { productId, action: 'Transferred to Retailer' }
      }
    ];
  }

  try {
    const { supplyChain } = getContracts();
    
    // Get all events for this product
    const provider = getProvider();
    const filter = supplyChain.filters.ProductStatusUpdated(productId);
    const events = await supplyChain.queryFilter(filter);
    
    const history = await Promise.all(
      events.map(async (event) => {
        const block = await provider.getBlock(event.blockNumber);
        return {
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
          type: 'STATUS_UPDATE',
          actor: event.args.updatedBy,
          data: {
            productId: event.args.productId,
            status: event.args.status,
            location: event.args.location
          }
        };
      })
    );
    
    return history;
    
  } catch (error) {
    console.error('❌ History error:', error.message);
    return [];
  }
}

/**
 * Update product price on blockchain
 */
export async function updatePrice(productId, price, notes = '') {
  if (!isRealBlockchain()) {
    console.log('📝 Mock Price Update:', { productId, price });
    return mockTx('price_update');
  }

  try {
    const { supplyChain } = getContracts();
    
    // Convert price to wei (smallest unit)
    const priceInWei = ethers.parseEther(price.toString());
    
    const tx = await supplyChain.updatePrice(productId, priceInWei, notes);
    console.log('⏳ Updating price on blockchain...');
    
    const receipt = await tx.wait();
    console.log('✅ Price updated:', receipt.hash);
    
    return receipt.hash;
    
  } catch (error) {
    console.error('❌ Price update error:', error.message);
    throw error;
  }
}

/**
 * Transfer product ownership
 */
export async function transferProduct(productId, toAddress, location, notes = '') {
  if (!isRealBlockchain()) {
    console.log('📝 Mock Transfer:', { productId, toAddress });
    return mockTx('transfer');
  }

  try {
    const { supplyChain } = getContracts();
    
    const tx = await supplyChain.transferProduct(productId, toAddress, location, notes);
    console.log('⏳ Transferring product on blockchain...');
    
    const receipt = await tx.wait();
    console.log('✅ Product transferred:', receipt.hash);
    
    return receipt.hash;
    
  } catch (error) {
    console.error('❌ Transfer error:', error.message);
    throw error;
  }
}

/**
 * Get product details from blockchain
 */
export async function getProductFromBlockchain(productId) {
  if (!isRealBlockchain()) {
    return {
      productId,
      name: 'Mock Product',
      origin: 'Mock Origin',
      category: 'Mock Category',
      timestamp: Date.now(),
      registeredBy: '0x0000000000000000000000000000000000000000'
    };
  }

  try {
    const { productRegistry } = getContracts();
    
    const product = await productRegistry.getProduct(productId);
    
    return {
      productId: product[0],
      name: product[1],
      origin: product[2],
      category: product[3],
      timestamp: Number(product[4]),
      registeredBy: product[5]
    };
    
  } catch (error) {
    console.error('❌ Get product error:', error.message);
    throw error;
  }
}

const blockchainEthereum = {
  recordToBlockchain,
  verifyBlockchainData,
  getBlockchainHistory,
  updatePrice,
  transferProduct,
  getProductFromBlockchain
};

export default blockchainEthereum;
