/**
 * Rate limiting middleware for public API endpoints
 * Simple in-memory rate limiter with IP-based throttling
 */

const rateLimitMap = new Map()

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per IP
}

/**
 * Check if request is rate limited
 * @param {string} identifier - IP address or user ID
 * @returns {Object} { allowed: boolean, remaining: number, reset: number }
 */
export function checkRateLimit(identifier) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.reset) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      reset: now + RATE_LIMIT_CONFIG.windowMs,
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      reset: now + RATE_LIMIT_CONFIG.windowMs,
    }
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      reset: record.reset,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - record.count,
    reset: record.reset,
  }
}

/**
 * Get client IP from request
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Cleanup old rate limit records (run periodically)
 */
export function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.reset) {
      rateLimitMap.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000)
}
