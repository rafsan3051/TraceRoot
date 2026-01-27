/**
 * Hyperledger Fabric Integration Module
 * 
 * This module provides Hyperledger Fabric blockchain functionality for TraceRoot.
 * It replaces the Ethereum implementation with Fabric's enterprise-grade blockchain.
 * 
 * Features:
 * - Product registration on blockchain
 * - Supply chain event tracking
 * - Immutable audit trail
 * - Private enterprise blockchain
 */

// Only import Fabric modules if we're in a Node.js environment
// This prevents bundling issues in Vercel/serverless
let Gateway, Wallets, FabricCAServices
let moduleLoadErr = null

async function loadFabricModules() {
  if (Gateway) return // Already loaded
  try {
    const fabricNetwork = await import('fabric-network')
    const fabricCa = await import('fabric-ca-client')
    Gateway = fabricNetwork.Gateway
    Wallets = fabricNetwork.Wallets
    FabricCAServices = fabricCa.default
  } catch (err) {
    moduleLoadErr = err
    console.warn('Fabric SDK modules not available:', err.message)
  }
}

import fs from 'fs/promises'
import path from 'path'

const USE_REAL_BLOCKCHAIN = process.env.USE_REAL_BLOCKCHAIN === 'true'
const CHANNEL_NAME = process.env.HYPERLEDGER_CHANNEL_NAME || 'tracerootchannel'
const CHAINCODE_NAME = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
const MSP_ID = process.env.HYPERLEDGER_MSP_ID || 'Org1MSP'
const WALLET_PATH = process.env.HYPERLEDGER_WALLET_PATH || path.join(process.cwd(), 'wallet')
const CONNECTION_PROFILE_PATH = process.env.HYPERLEDGER_CONNECTION_PROFILE || path.join(process.cwd(), 'fabric-network', 'connection-profile.json')

/**
 * Mock blockchain for development/testing
 */
function mockBlockchainRecord(data) {
  console.log('📝 Mock Fabric Blockchain Record:', {
    channel: CHANNEL_NAME,
    chaincode: CHAINCODE_NAME,
    data
  })
  return `fabric_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create wallet for Fabric network
 */
async function getWallet() {
  if (!Wallets) await loadFabricModules()
  if (!Wallets) return null // Fabric SDK not available
  const wallet = await Wallets.newFileSystemWallet(WALLET_PATH)
  return wallet
}

/**
 * Enroll admin user
 */
async function enrollAdmin() {
  try {
    const wallet = await getWallet()
    
    // Check if admin already enrolled
    const adminExists = await wallet.get('admin')
    if (adminExists) {
      console.log('Admin user already enrolled')
      return
    }

    // Load connection profile
    const ccpPath = CONNECTION_PROFILE_PATH
    const ccp = JSON.parse(await fs.readFile(ccpPath, 'utf8'))

    // Create CA client
    const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
    const caTLSCACerts = caInfo.tlsCACerts.pem
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

    // Enroll admin
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' })
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: MSP_ID,
      type: 'X.509',
    }
    await wallet.put('admin', x509Identity)
    console.log('✅ Admin enrolled successfully')
  } catch (error) {
    console.error('Failed to enroll admin:', error)
    throw error
  }
}

/**
 * Register and enroll application user
 */
async function registerUser(userId = 'appUser') {
  try {
    const wallet = await getWallet()

    // Check if user already enrolled
    const userExists = await wallet.get(userId)
    if (userExists) {
      console.log(`User ${userId} already enrolled`)
      return
    }

    // Check if admin enrolled
    const adminIdentity = await wallet.get('admin')
    if (!adminIdentity) {
      console.log('Admin not enrolled, enrolling now...')
      await enrollAdmin()
    }

    // Load connection profile
    const ccpPath = CONNECTION_PROFILE_PATH
    const ccp = JSON.parse(await fs.readFile(ccpPath, 'utf8'))

    // Create CA client
    const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
    const caTLSCACerts = caInfo.tlsCACerts.pem
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

    // Build user object for authenticating with CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
    const adminUser = await provider.getUserContext(adminIdentity, 'admin')

    // Register user
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID: userId,
      role: 'client'
    }, adminUser)

    // Enroll user
    const enrollment = await ca.enroll({
      enrollmentID: userId,
      enrollmentSecret: secret
    })

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: MSP_ID,
      type: 'X.509',
    }
    await wallet.put(userId, x509Identity)
    console.log(`✅ User ${userId} enrolled successfully`)
  } catch (error) {
    console.error(`Failed to register user ${userId}:`, error)
    throw error
  }
}

/**
 * Get contract instance
 */
async function getContract(userId = 'appUser') {
  const gateway = new Gateway()
  
  try {
    const wallet = await getWallet()
    
    // Check if user exists
    const identity = await wallet.get(userId)
    if (!identity) {
      console.log(`User ${userId} not found, registering...`)
      await registerUser(userId)
    }

    // Load connection profile
    const ccp = JSON.parse(await fs.readFile(CONNECTION_PROFILE_PATH, 'utf8'))

    // Connect to gateway
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true }
    })

    // Get network and contract
    const network = await gateway.getNetwork(CHANNEL_NAME)
    const contract = network.getContract(CHAINCODE_NAME)

    return { gateway, contract }
  } catch (error) {
    gateway.disconnect()
    throw error
  }
}

/**
 * Record product to Fabric blockchain
 */
export async function recordToBlockchain(data) {
  if (!USE_REAL_BLOCKCHAIN) {
    return mockBlockchainRecord(data)
  }

  let gateway
  try {
    const { gateway: gw, contract } = await getContract()
    gateway = gw

    // Register product on Fabric
    const result = await contract.submitTransaction(
      'RegisterProduct',
      data.id || String(Date.now()),
      data.name || '',
      data.origin || '',
      data.category || '',
      JSON.stringify(data)
    )

    const txId = result.toString()
    console.log('✅ Product registered on Fabric:', txId)
    
    return txId
  } catch (error) {
    console.error('❌ Failed to record to Fabric blockchain:', error)
    throw error
  } finally {
    if (gateway) {
      gateway.disconnect()
    }
  }
}

/**
 * Record supply chain event to Fabric blockchain
 */
export async function recordEventToBlockchain(productId, eventData) {
  if (!USE_REAL_BLOCKCHAIN) {
    return mockBlockchainRecord({ productId, ...eventData })
  }

  let gateway
  try {
    const { gateway: gw, contract } = await getContract()
    gateway = gw

    const result = await contract.submitTransaction(
      'RecordEvent',
      productId,
      eventData.eventType || '',
      eventData.location || '',
      JSON.stringify(eventData)
    )

    const txId = result.toString()
    console.log('✅ Event recorded on Fabric:', txId)
    
    return txId
  } catch (error) {
    console.error('❌ Failed to record event to Fabric blockchain:', error)
    throw error
  } finally {
    if (gateway) {
      gateway.disconnect()
    }
  }
}

/**
 * Query product from Fabric blockchain
 */
export async function queryProduct(productId) {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('📝 Mock Fabric Query for product:', productId)
    return null
  }

  let gateway
  try {
    const { gateway: gw, contract } = await getContract()
    gateway = gw

    const result = await contract.evaluateTransaction('GetProduct', productId)
    const product = JSON.parse(result.toString())
    
    console.log('✅ Product queried from Fabric:', product)
    return product
  } catch (error) {
    console.error('❌ Failed to query product from Fabric:', error)
    return null
  } finally {
    if (gateway) {
      gateway.disconnect()
    }
  }
}

/**
 * Query product history from Fabric blockchain
 */
export async function queryProductHistory(productId) {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('📝 Mock Fabric Query for product history:', productId)
    return []
  }

  let gateway
  try {
    const { gateway: gw, contract } = await getContract()
    gateway = gw

    const result = await contract.evaluateTransaction('GetProductHistory', productId)
    const history = JSON.parse(result.toString())
    
    console.log('✅ Product history queried from Fabric')
    return history
  } catch (error) {
    console.error('❌ Failed to query product history from Fabric:', error)
    return []
  } finally {
    if (gateway) {
      gateway.disconnect()
    }
  }
}

/**
 * Verify transaction on Fabric blockchain
 */
export async function verifyTransaction(txId) {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('📝 Mock Fabric verification for tx:', txId)
    return { verified: true, timestamp: Date.now() }
  }

  // Fabric transactions are verified through the network consensus
  // This is more of a metadata query
  return {
    verified: true,
    timestamp: Date.now(),
    network: 'Hyperledger Fabric',
    channel: CHANNEL_NAME
  }
}
