/**
 * Security headers middleware configuration
 * Implements CSP, HSTS, and other security best practices
 */

/**
 * Generate Content Security Policy header
 * @param {boolean} isDev - Whether running in development
 * @returns {string} CSP header value
 */
export function generateCSP(isDev = false) {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : "'strict-dynamic' 'nonce-{NONCE}'"}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.mapbox.com https://*.tiles.mapbox.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ]

  return directives.join('; ')
}

/**
 * Get all security headers
 * @param {boolean} isDev - Whether running in development
 * @returns {Object} Headers object
 */
export function getSecurityHeaders(isDev = false) {
  return {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(isDev),
    // Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS Protection
    'X-Frame-Options': 'DENY',
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    // Cross-Origin Policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-site',
  }
}

/**
 * Apply security headers to response
 * @param {Response} response - Next.js response
 * @param {boolean} isDev - Whether running in development
 * @returns {Response} Response with headers
 */
export function applySecurityHeaders(response, isDev = false) {
  const headers = getSecurityHeaders(isDev)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
