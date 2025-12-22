/**
 * Product API Tests
 * Tests for product creation, retrieval, and management
 */

import { POST as createProduct, GET as getProducts } from '@/app/api/product/route'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    product: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/blockchain', () => ({
  recordToBlockchain: jest.fn().mockResolvedValue('mock-tx-123'),
}))

jest.mock('@/lib/auth/auth-utils', () => ({
  getSession: jest.fn(),
}))

const prisma = require('@/lib/prisma').default
const { recordToBlockchain } = require('@/lib/blockchain')
const { getSession } = require('@/lib/auth/auth-utils')

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/product', () => {
    it('should create a new product for authenticated farmer', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'farmer@example.com',
        role: 'FARMER',
        verified: true,
      }

      const mockProduct = {
        id: 'product-1',
        name: 'Organic Tomatoes',
        origin: 'Dhaka Farm',
        manufactureDate: new Date('2025-01-01'),
        blockchainTxId: 'mock-tx-123',
        farmerId: 'user-1',
        price: 150.50,
        category: 'Vegetables',
        latitude: 23.8103,
        longitude: 90.4125,
      }

      getSession.mockResolvedValue({ id: 'user-1' })
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.product.create.mockResolvedValue(mockProduct)
      prisma.product.update.mockResolvedValue({ ...mockProduct, qrCodeUrl: 'http://localhost:3000/product/product-1' })

      const request = new Request('http://localhost:3000/api/product', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Organic Tomatoes',
          origin: 'Dhaka Farm',
          manufactureDate: '2025-01-01',
          price: 150.50,
          category: 'Vegetables',
          latitude: 23.8103,
          longitude: 90.4125,
        }),
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.product.name).toBe('Organic Tomatoes')
      expect(recordToBlockchain).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PRODUCT_CREATION',
          data: expect.objectContaining({
            name: 'Organic Tomatoes',
            origin: 'Dhaka Farm',
          }),
        })
      )
    })

    it('should reject product creation for unauthenticated user', async () => {
      getSession.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/product', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          origin: 'Test Farm',
          manufactureDate: '2025-01-01',
        }),
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject product creation for non-farmer role', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'CONSUMER',
        verified: true,
      }

      getSession.mockResolvedValue({ id: 'user-1' })
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/product', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          origin: 'Test Farm',
          manufactureDate: '2025-01-01',
        }),
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Only farmers can register products')
    })

    it('should reject product creation with missing required fields', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'FARMER',
        verified: true,
      }

      getSession.mockResolvedValue({ id: 'user-1' })
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/product', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          // missing origin and manufactureDate
        }),
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })

  describe('GET /api/product', () => {
    it('should return all visible products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Organic Tomatoes',
          origin: 'Dhaka Farm',
          price: 150.50,
          hidden: false,
          events: [],
        },
        {
          id: 'product-2',
          name: 'Fresh Milk',
          origin: 'Chittagong Dairy',
          price: 80.00,
          hidden: false,
          events: [],
        },
      ]

      prisma.product.findMany.mockResolvedValue(mockProducts)

      const request = new Request('http://localhost:3000/api/product')
      const response = await getProducts(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toHaveLength(2)
      expect(data.products[0].name).toBe('Organic Tomatoes')
    })

    it('should include hidden products for admin with includeHidden param', async () => {
      const mockUser = {
        id: 'admin-1',
        role: 'ADMIN',
      }

      const mockProducts = [
        {
          id: 'product-1',
          name: 'Visible Product',
          hidden: false,
          price: 100,
          events: [],
        },
        {
          id: 'product-2',
          name: 'Hidden Product',
          hidden: true,
          price: 200,
          events: [],
        },
      ]

      getSession.mockResolvedValue({ id: 'admin-1' })
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.product.findMany.mockResolvedValue(mockProducts)

      const request = new Request('http://localhost:3000/api/product?includeHidden=true')
      const response = await getProducts(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toHaveLength(2)
    })
  })
})
