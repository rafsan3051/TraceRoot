/**
 * Blockchain Price Module
 * - Provides safe wrappers to read/update price on SupplyChain contract
 * - Gracefully falls back to mock/off-chain when blockchain is not configured
 */

const USE_REAL_BLOCKCHAIN = process.env.USE_REAL_BLOCKCHAIN === 'true'

function isConfiguredForBlockchain() {
  return (
    USE_REAL_BLOCKCHAIN === true &&
    !!process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS &&
    !!(process.env.ETHEREUM_TESTNET_RPC_URL || process.env.ETHEREUM_RPC_URL)
  )
}

function getContractABI() {
  return [
    // Write
    'function updatePrice(string _productId, uint256 _newPrice, string _notes) public',
    // Reads
    'function getLatestPrice(string _productId) view returns (uint256)',
    'function getPriceHistory(string _productId) view returns (tuple(uint256 price,address actor,string notes,uint256 timestamp)[])'
  ]
}

async function getProviderAndSigner() {
  // Use a literal module name to avoid Webpack's
  // "request of a dependency is an expression" warning
  const { ethers } = await import('ethers')

  const rpcUrl = process.env.ETHEREUM_TESTNET_RPC_URL || process.env.ETHEREUM_RPC_URL
  const provider = new ethers.JsonRpcProvider(rpcUrl)

  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
  const wallet = privateKey ? new ethers.Wallet(privateKey, provider) : null

  return { ethers, provider, wallet }
}

export async function getLatestPrice(productId) {
  try {
    if (!isConfiguredForBlockchain()) {
      return { price: 0, source: 'mock' }
    }

    const { ethers, provider } = await getProviderAndSigner()
    const contract = new ethers.Contract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      getContractABI(),
      provider
    )

    const price = await contract.getLatestPrice(productId)
    return { price: Number(price), source: 'onchain' }
  } catch (error) {
    console.error('getLatestPrice error:', error)
    return { price: 0, source: 'fallback', error: 'unavailable' }
  }
}

export async function getPriceHistory(productId) {
  try {
    if (!isConfiguredForBlockchain()) {
      return { history: [], source: 'mock' }
    }

    const { ethers, provider } = await getProviderAndSigner()
    const contract = new ethers.Contract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      getContractABI(),
      provider
    )

    const raw = await contract.getPriceHistory(productId)
    const history = raw.map((rec) => ({
      price: Number(rec.price),
      actor: String(rec.actor),
      notes: String(rec.notes),
      timestamp: Number(rec.timestamp)
    }))
    return { history, source: 'onchain' }
  } catch (error) {
    console.error('getPriceHistory error:', error)
    return { history: [], source: 'fallback', error: 'unavailable' }
  }
}

export async function updatePrice(productId, newPrice, notes = '') {
  try {
    if (!isConfiguredForBlockchain()) {
      return { txHash: null, source: 'mock', updated: false, message: 'blockchain_disabled' }
    }

    const { ethers, wallet } = await getProviderAndSigner()
    if (!wallet) {
      return { txHash: null, source: 'fallback', updated: false, message: 'missing_private_key' }
    }

    const contract = new ethers.Contract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      getContractABI(),
      wallet
    )

    const tx = await contract.updatePrice(productId, BigInt(Math.floor(newPrice)), notes)
    const receipt = await tx.wait()
    return { txHash: receipt.hash, source: 'onchain', updated: true }
  } catch (error) {
    console.error('updatePrice error:', error)
    return { txHash: null, source: 'fallback', updated: false, message: 'tx_failed' }
  }
}
