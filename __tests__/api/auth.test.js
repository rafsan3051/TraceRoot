/**
 * Authentication API Tests
 * Tests for login, register, and session management
 */

import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { GET as checkHandler } from '@/app/api/auth/check/route'
import bcrypt from 'bcryptjs'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock auth utils
jest.mock('@/lib/auth/auth-utils', () => ({
  createSession: jest.fn().mockResolvedValue('mock-session-token'),
  getSession: jest.fn(),
}))

const prisma = require('@/lib/prisma').default
const { createSession, getSession } = require('@/lib/auth/auth-utils')

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'FARMER',
        verified: false,
      }

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'FARMER',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Registration successful')
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should reject registration with existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'test@example.com' })

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'FARMER',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
    })

    it('should reject registration with missing fields', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // missing password, name, role
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'FARMER',
        verified: true,
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(createSession).toHaveBeenCalled()
    })

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        verified: true,
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should reject login for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('GET /api/auth/check', () => {
    it('should return authenticated user session', async () => {
      const mockSession = {
        id: '1',
        email: 'test@example.com',
        role: 'FARMER',
      }

      getSession.mockResolvedValue(mockSession)

      const request = new Request('http://localhost:3000/api/auth/check')
      const response = await checkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authenticated).toBe(true)
      expect(data.user).toEqual(mockSession)
    })

    it('should return unauthenticated when no session', async () => {
      getSession.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/check')
      const response = await checkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authenticated).toBe(false)
    })
  })
})
