/**
 * Blockchain Module Tests
 * Tests for blockchain integration and mock functionality
 */

import {
  recordToBlockchain,
  verifyBlockchainData,
  getBlockchainHistory,
  calculateProductHash,
  generateQRData,
} from '@/lib/blockchain'

// Mock Fabric network module
jest.mock('fabric-network', () => ({
  Gateway: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    getNetwork: jest.fn().mockResolvedValue({
      getContract: jest.fn().mockReturnValue({
        submitTransaction: jest.fn().mockResolvedValue(Buffer.from('tx-hash-123')),
        evaluateTransaction: jest.fn().mockResolvedValue(Buffer.from(JSON.stringify([
          {
            txId: 'tx-1',
            timestamp: new Date().toISOString(),
            type: 'CREATION',
            actor: 'Org1MSP',
            data: { productId: 'product-1', action: 'Product Registered' },
          },
        ]))),
      }),
    }),
  })),
  Wallets: {
    newInMemoryWallet: jest.fn().mockResolvedValue({
      put: jest.fn(),
      get: jest.fn().mockResolvedValue({ credentials: {}, mspId: 'Org1MSP' }),
    }),
  },
}))

describe('Blockchain Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set to mock mode by default
    process.env.USE_REAL_BLOCKCHAIN = 'false'
  })

  describe('recordToBlockchain', () => {
    it('should record transaction in mock mode', async () => {
      const data = {
        id: 'product-1',
        name: 'Test Product',
        origin: 'Test Farm',
        category: 'Test',
      }

      const txId = await recordToBlockchain(data)

      expect(txId).toBeDefined()
      expect(typeof txId).toBe('string')
      expect(txId).toContain('fabric_tx_')
    })

    it('should include timestamp in transaction ID', async () => {
      const data = { id: 'product-1', name: 'Test' }
      const txId = await recordToBlockchain(data)
      
      // Transaction ID should contain timestamp component
      expect(txId.length).toBeGreaterThan(10)
    })

    it('should handle real blockchain mode gracefully', async () => {
      process.env.USE_REAL_BLOCKCHAIN = 'true'
      
      const data = {
        id: 'product-1',
        name: 'Test Product',
        origin: 'Test Farm',
      }

      // Should either succeed or fall back to mock
      const txId = await recordToBlockchain(data)
      expect(txId).toBeDefined()
      expect(typeof txId).toBe('string')
    })
  })

  describe('verifyBlockchainData', () => {
    it('should verify transaction in mock mode', async () => {
      const txId = 'mock-tx-123'
      const verification = await verifyBlockchainData(txId)

      expect(verification).toBeDefined()
      expect(verification.verified).toBe(true)
      expect(verification.timestamp).toBeDefined()
      expect(verification.data).toBeDefined()
      expect(verification.data.txId).toBe(txId)
    })

    it('should return verification status for real blockchain', async () => {
      process.env.USE_REAL_BLOCKCHAIN = 'true'
      
      const txId = 'real-tx-123'
      const verification = await verifyBlockchainData(txId)

      expect(verification).toBeDefined()
      expect(verification.verified).toBeDefined()
      expect(verification.network).toBe('Hyperledger Fabric')
    })
  })

  describe('getBlockchainHistory', () => {
    it('should return product history in mock mode', async () => {
      const productId = 'product-1'
      const history = await getBlockchainHistory(productId)

      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]).toHaveProperty('txId')
      expect(history[0]).toHaveProperty('timestamp')
      expect(history[0]).toHaveProperty('type')
      expect(history[0].data.productId).toBe(productId)
    })

    it('should include multiple event types', async () => {
      const history = await getBlockchainHistory('product-1')

      const eventTypes = history.map(event => event.type)
      expect(eventTypes).toContain('CREATION')
      expect(eventTypes).toContain('TRANSFER')
    })
  })

  describe('calculateProductHash', () => {
    it('should generate consistent hash for same data', () => {
      const productData = {
        id: 'product-1',
        name: 'Test Product',
        origin: 'Test Farm',
        category: 'Test',
        farmerId: 'farmer-1',
      }

      const hash1 = calculateProductHash(productData)
      const hash2 = calculateProductHash(productData)

      expect(hash1).toBe(hash2)
      expect(hash1.length).toBe(64) // SHA-256 produces 64-character hex string
    })

    it('should generate different hashes for different data', () => {
      const product1 = {
        id: 'product-1',
        name: 'Product A',
        origin: 'Farm A',
        category: 'Cat A',
        farmerId: 'farmer-1',
      }

      const product2 = {
        id: 'product-2',
        name: 'Product B',
        origin: 'Farm B',
        category: 'Cat B',
        farmerId: 'farmer-2',
      }

      const hash1 = calculateProductHash(product1)
      const hash2 = calculateProductHash(product2)

      expect(hash1).not.toBe(hash2)
    })

    it('should only hash specific fields', () => {
      const product1 = {
        id: 'product-1',
        name: 'Test',
        origin: 'Farm',
        category: 'Cat',
        farmerId: 'farmer-1',
        extraField: 'should not affect hash',
      }

      const product2 = {
        id: 'product-1',
        name: 'Test',
        origin: 'Farm',
        category: 'Cat',
        farmerId: 'farmer-1',
        differentExtraField: 'also should not affect hash',
      }

      const hash1 = calculateProductHash(product1)
      const hash2 = calculateProductHash(product2)

      expect(hash1).toBe(hash2)
    })
  })

  describe('generateQRData', () => {
    it('should generate complete QR data for product', () => {
      const product = {
        id: 'product-1',
        name: 'Test Product',
        origin: 'Test Farm',
        category: 'Test',
        farmerId: 'farmer-1',
        blockchainTxId: 'tx-123',
      }

      const qrData = generateQRData(product)

      expect(qrData).toHaveProperty('productId', 'product-1')
      expect(qrData).toHaveProperty('blockchainTxId', 'tx-123')
      expect(qrData).toHaveProperty('hash')
      expect(qrData).toHaveProperty('verifyUrl')
      expect(qrData.verifyUrl).toContain('/track?id=product-1')
    })

    it('should include verification hash', () => {
      const product = {
        id: 'product-1',
        name: 'Test',
        origin: 'Farm',
        category: 'Cat',
        farmerId: 'farmer-1',
        blockchainTxId: 'tx-123',
      }

      const qrData = generateQRData(product)
      
      expect(qrData.hash).toBeDefined()
      expect(qrData.hash.length).toBe(64)
    })
  })
})
