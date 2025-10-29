/**
 * Server-side authentication verification utilities
 * Used by API routes to verify JWT tokens and extract user data
 */

import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
)

/**
 * Verify authentication token and return user data
 * @param {string} token - JWT token from cookie or header
 * @returns {Promise<{user: object} | {error: string}>}
 */
export async function verifyAuth(token) {
  if (!token) {
    return { error: 'No authentication token provided' }
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (!payload.userId) {
      return { error: 'Invalid token payload' }
    }

    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        verified: payload.verified || false
      }
    }
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return { error: 'Invalid or expired token' }
  }
}

/**
 * Extract auth token from request
 * Checks cookies and Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string | null}
 */
export function getAuthToken(request) {
  // Try cookie first
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) return cookieToken

  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Verify request has valid authentication and return user
 * @param {Request} request - Next.js request object
 * @returns {Promise<{user: object} | {error: string}>}
 */
export async function verifyRequest(request) {
  const token = getAuthToken(request)
  return verifyAuth(token)
}

/**
 * Check if user has required role
 * @param {object} user - User object from verifyAuth
 * @param {string | string[]} allowedRoles - Required role(s)
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(user.role)
}

/**
 * Check if user is verified
 * @param {object} user - User object from verifyAuth
 * @returns {boolean}
 */
export function isVerified(user) {
  return user?.verified === true
}
