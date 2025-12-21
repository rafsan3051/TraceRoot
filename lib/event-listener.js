/**
 * Event Listener Service
 * Listens to PriceUpdated events on Ethereum and mirrors to Fabric
 * Also indexes prices in MongoDB for fast queries
 */

import { ethers } from 'ethers';
import prisma from '@/lib/prisma';

const USE_REAL_BLOCKCHAIN = process.env.USE_REAL_BLOCKCHAIN === 'true';

async function getProvider() {
  if (!USE_REAL_BLOCKCHAIN) return null;
  
  const rpcUrl = process.env.ETHEREUM_TESTNET_RPC_URL || process.env.ETHEREUM_RPC_URL;
  if (!rpcUrl) return null;
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function getSupplyChainContract(provider) {
  if (!provider) return null;
  
  const abi = [
    'event PriceUpdated(string indexed productId, uint256 oldPrice, uint256 newPrice, address indexed updatedBy, uint256 timestamp)'
  ];

  return new ethers.Contract(
    process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
    abi,
    provider
  );
}

async function indexPriceUpdate(productId, newPrice, oldPrice, actor, txHash) {
  try {
    // Store in MongoDB for fast access
    await prisma.auditLog.create({
      data: {
        type: 'PRICE_INDEXED',
        message: `Price changed from ${oldPrice} to ${newPrice}`,
        productId,
        extra: JSON.stringify({ newPrice, oldPrice, txHash, actor, indexed: new Date() })
      }
    });
    
    console.log(`✅ Price indexed: ${productId} = ${newPrice}`);
  } catch (error) {
    console.error('❌ Failed to index price:', error.message);
  }
}

/**
 * Start listening to PriceUpdated events
 */
export async function startEventListener() {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('ℹ️  Event listener disabled (USE_REAL_BLOCKCHAIN=false)');
    return;
  }

  const provider = await getProvider();
  if (!provider) {
    console.log('⚠️  Event listener: no RPC configured');
    return;
  }

  try {
    const contract = await getSupplyChainContract(provider);
    if (!contract) {
      console.log('⚠️  Event listener: no contract address configured');
      return;
    }

    const filter = contract.filters.PriceUpdated();
    
    contract.on(filter, async (productId, oldPrice, newPrice, updatedBy, timestamp, event) => {
      console.log(`🔔 PriceUpdated event received:`, {
        productId,
        oldPrice: oldPrice.toString(),
        newPrice: newPrice.toString(),
        updatedBy,
        txHash: event.transactionHash
      });

      await indexPriceUpdate(
        productId,
        Number(newPrice),
        Number(oldPrice),
        updatedBy,
        event.transactionHash
      );

      // TODO: Mirror to Fabric chaincode if connected
      // TODO: Trigger notifications
    });

    console.log('🎧 Event listener started: listening for PriceUpdated events');
  } catch (error) {
    console.error('❌ Failed to start event listener:', error.message);
  }
}

/**
 * Get recent price changes
 */
export async function getRecentPriceChanges(limit = 10) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { type: 'PRICE_INDEXED' },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return logs.map(log => ({
      ...log,
      extra: JSON.parse(log.extra || '{}')
    }));
  } catch (error) {
    console.error('❌ Failed to get recent price changes:', error.message);
    return [];
  }
}
