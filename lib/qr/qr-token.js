/**
 * QR Token Generation and Verification
 * Creates signed JWT tokens for offline QR verification
 */

import { SignJWT, jwtVerify } from 'jose'

const QR_SECRET = new TextEncoder().encode(
  process.env.QR_SIGNING_SECRET || 'default-qr-secret-change-in-production'
)

/**
 * Generate a signed QR token
 * @param {Object} payload - { productId, version, name?, category? }
 * @param {number} expiryHours - Token validity in hours (default: 8760 = 1 year)
 * @returns {Promise<string>} Signed JWT
 */
export async function generateQRToken(payload, expiryHours = 8760) {
  const token = await new SignJWT({
    productId: payload.productId,
    version: payload.version,
    name: payload.name,
    category: payload.category,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiryHours}h`)
    .setIssuer('traceroot-qr')
    .setSubject(`product:${payload.productId}`)
    .sign(QR_SECRET)

  return token
}

/**
 * Verify and decode a QR token
 * @param {string} token - JWT string
 * @returns {Promise<Object>} Decoded payload or throws
 */
export async function verifyQRToken(token) {
  try {
    const { payload } = await jwtVerify(token, QR_SECRET, {
      issuer: 'traceroot-qr',
    })
    return payload
  } catch (error) {
    throw new Error(`Invalid QR token: ${error.message}`)
  }
}

/**
 * Build QR value with embedded token
 * Format: https://domain/verify/[id]?t=<token>&v=<version>
 * @param {string} baseUrl - App base URL
 * @param {Object} product - Product data
 * @param {string} versionKey - Version identifier
 * @returns {Promise<string>} QR URL with token
 */
export async function buildSecureQRValue(baseUrl, product, versionKey) {
  const token = await generateQRToken({
    productId: product.id,
    version: versionKey,
    name: product.name,
    category: product.category,
  })

  const url = new URL(`/verify/${product.id}`, baseUrl)
  url.searchParams.set('t', token)
  url.searchParams.set('v', versionKey)

  return url.toString()
}
