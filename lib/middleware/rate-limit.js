/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting requests per IP/user
 * Uses in-memory store for simplicity (upgrade to Redis in production)
 */

import { NextResponse } from 'next/server'
import { createRateLimitError } from '@/lib/api-error-handler'

// In-memory rate limit store
// TODO: Use Redis in production for distributed systems
const rateLimitStore = new Map()
const CLEANUP_INTERVAL = 60000 // 1 minute

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.lastReset > 3600000) { // 1 hour
      rateLimitStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

/**
 * Get client IP from request
 */
function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check rate limit for a key
 * Returns true if limit exceeded
 */
function isRateLimited(key, limit = 100, windowMs = 60000) {
  const now = Date.now()
  const data = rateLimitStore.get(key) || { count: 0, lastReset: now }

  // Reset counter if window expired
  if (now - data.lastReset > windowMs) {
    rateLimitStore.set(key, { count: 1, lastReset: now })
    return false
  }

  // Increment counter
  data.count++
  rateLimitStore.set(key, data)

  return data.count > limit
}

/**
 * Middleware for general API rate limiting
 * Limit: 100 requests per minute per IP
 */
export function rateLimit(options = {}) {
  const {
    limit = 100,
    windowMs = 60000,
    message = 'Too many requests'
  } = options

  return (handler) => {
    return async (request) => {
      const ip = getClientIp(request)
      const key = `rate_limit:${ip}`

      if (isRateLimited(key, limit, windowMs)) {
        const error = createRateLimitError(Math.ceil(windowMs / 1000))
        return NextResponse.json(error.toJSON(), { status: 429 })
      }

      return handler(request)
    }
  }
}

/**
 * Middleware for auth endpoint rate limiting
 * Stricter limits: 5 attempts per 15 minutes per IP
 */
export function authRateLimit() {
  return (handler) => {
    return async (request) => {
      const ip = getClientIp(request)
      const key = `auth_rate_limit:${ip}`
      const limit = 5
      const windowMs = 900000 // 15 minutes

      if (isRateLimited(key, limit, windowMs)) {
        const error = createRateLimitError(Math.ceil(windowMs / 1000))
        return NextResponse.json(error.toJSON(), { status: 429 })
      }

      return handler(request)
    }
  }
}

/**
 * Middleware for brute force protection on login
 * Per-username/email rate limiting
 */
export function bruteForceProtection() {
  return (handler) => {
    return async (request) => {
      try {
        const body = await request.json()
        const email = body.email || body.username
        
        if (!email) {
          return handler(request)
        }

        const key = `brute_force:${email}`
        const limit = 5
        const windowMs = 900000 // 15 minutes

        if (isRateLimited(key, limit, windowMs)) {
          const error = createRateLimitError(Math.ceil(windowMs / 1000))
          return NextResponse.json(error.toJSON(), { status: 429 })
        }

        // Clone request for handler since we consumed the body
        const clonedRequest = request.clone()
        return handler(clonedRequest)
      } catch {
        return handler(request)
      }
    }
  }
}

export { getClientIp, isRateLimited }
