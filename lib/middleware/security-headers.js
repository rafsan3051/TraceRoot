/**
 * Security Headers Middleware
 * 
 * Adds security headers to all responses
 * Protects against XSS, clickjacking, and other attacks
 */

import { NextResponse } from 'next/server'

/**
 * Security headers configuration
 */
const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Enable XSS protection (browser feature)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=()',

  // Content Security Policy (CSP)
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests",

  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Middleware to apply security headers
 */
export async function securityHeadersMiddleware(request, response) {
  return addSecurityHeaders(response)
}

/**
 * Middleware wrapper for Next.js API routes
 */
export function withSecurityHeaders(handler) {
  return async (request, context) => {
    const response = await handler(request, context)
    return addSecurityHeaders(response)
  }
}

export default securityHeaders
