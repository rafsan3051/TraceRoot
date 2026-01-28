/**
 * CSRF Protection Middleware
 * 
 * Implements token-based CSRF protection
 * Generates and validates CSRF tokens for state-changing operations
 */

import { jwtVerify, SignJWT } from 'jose'
import { NextResponse } from 'next/server'
import { createValidationError } from '@/lib/api-error-handler'

const secretKey = process.env.JWT_SECRET
if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is required for CSRF protection')
}

const key = new TextEncoder().encode(secretKey)

/**
 * Generate CSRF token
 */
export async function generateCsrfToken(sessionId = null) {
  const token = await new SignJWT({
    type: 'csrf',
    iat: Math.floor(Date.now() / 1000),
    sessionId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(key)

  return token
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(token) {
  try {
    const verified = await jwtVerify(token, key)
    
    if (verified.payload.type !== 'csrf') {
      return null
    }

    return verified.payload
  } catch (error) {
    console.error('CSRF token verification failed:', error.message)
    return null
  }
}

/**
 * CSRF protection middleware for state-changing operations
 * Should be applied to POST, PUT, DELETE, PATCH requests
 */
export function withCsrfProtection(handler) {
  return async (request, context) => {
    // Skip CSRF check for GET and OPTIONS requests
    if (request.method === 'GET' || request.method === 'OPTIONS') {
      return handler(request, context)
    }

    // Get CSRF token from headers or body
    let csrfToken = request.headers.get('x-csrf-token')

    if (!csrfToken) {
      try {
        const body = await request.clone().json()
        csrfToken = body._csrf || body.csrfToken
      } catch {
        // Body might not be JSON
      }
    }

    if (!csrfToken) {
      const error = createValidationError({
        csrfToken: 'CSRF token is required'
      })
      return NextResponse.json(error.toJSON(), { status: 400 })
    }

    // Verify CSRF token
    const verified = await verifyCsrfToken(csrfToken)
    if (!verified) {
      const error = createValidationError({
        csrfToken: 'Invalid CSRF token'
      })
      return NextResponse.json(error.toJSON(), { status: 403 })
    }

    // Add CSRF payload to request for downstream handlers
    request.csrfToken = verified

    return handler(request, context)
  }
}

/**
 * Get CSRF token endpoint response
 * Returns CSRF token for client to use in subsequent requests
 */
export async function getCsrfTokenResponse(sessionId = null) {
  const token = await generateCsrfToken(sessionId)
  return NextResponse.json(
    {
      csrfToken: token,
      expiresIn: 86400 // 24 hours in seconds
    },
    { status: 200 }
  )
}

const csrfProtectionExports = {
  generateCsrfToken,
  verifyCsrfToken,
  withCsrfProtection,
  getCsrfTokenResponse
}

export default csrfProtectionExports
