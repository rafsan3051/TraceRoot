/**
 * Simple in-memory rate limiting for APIs
 * Tracks request counts by key with automatic cleanup
 */

const requestMap = new Map()

/**
 * Check if a request is allowed under rate limit
 * @param {string} key - Unique identifier (e.g., "forgot-password:192.168.1.1")
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {boolean} true if request is allowed, false if rate limited
 */
export function checkRateLimit(key, maxRequests = 5, windowSeconds = 3600) {
  const now = Date.now()
  
  if (!requestMap.has(key)) {
    requestMap.set(key, [])
  }
  
  const timestamps = requestMap.get(key)
  
  // Remove old timestamps outside the window
  const cutoffTime = now - windowSeconds * 1000
  const validTimestamps = timestamps.filter(ts => ts > cutoffTime)
  
  // Check if under limit
  if (validTimestamps.length < maxRequests) {
    validTimestamps.push(now)
    requestMap.set(key, validTimestamps)
    return true
  }
  
  // Still within limit, update timestamps
  requestMap.set(key, validTimestamps)
  return false
}

/**
 * Reset rate limit for a key (useful for admin/testing)
 * @param {string} key - Unique identifier
 */
export function resetRateLimit(key) {
  requestMap.delete(key)
}

/**
 * Clear all rate limit data
 */
export function clearAllRateLimits() {
  requestMap.clear()
}

/**
 * Get remaining requests for a key
 * @param {string} key - Unique identifier
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {number} Number of remaining requests (0 if limited)
 */
export function getRemainingRequests(key, maxRequests = 5, windowSeconds = 3600) {
  const now = Date.now()
  
  if (!requestMap.has(key)) {
    return maxRequests
  }
  
  const timestamps = requestMap.get(key)
  const cutoffTime = now - windowSeconds * 1000
  const validTimestamps = timestamps.filter(ts => ts > cutoffTime)
  
  return Math.max(0, maxRequests - validTimestamps.length)
}
