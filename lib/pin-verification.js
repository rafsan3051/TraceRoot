/**
 * PIN Verification Service
 * Handles generation, storage, and verification of 6-8 digit PINs
 */

import crypto from 'crypto'

/**
 * Generate a random PIN
 * @param {number} length - Length of PIN (6 or 8)
 * @returns {string} - Generated PIN
 */
export function generatePIN(length = 6) {
  if (length !== 6 && length !== 8) {
    throw new Error('PIN length must be 6 or 8')
  }
  
  // Generate cryptographically secure random number
  const max = Math.pow(10, length)
  const randomNum = crypto.randomInt(0, max)
  
  // Pad with leading zeros if needed
  return randomNum.toString().padStart(length, '0')
}

/**
 * Store for in-memory PINs (for development/testing)
 * In production, use database
 */
const pinStore = new Map()

/**
 * Store a PIN with expiration
 * @param {string} email - User email
 * @param {string} pin - Generated PIN
 * @param {string} type - PIN type ('forgot_password' or 'email_verification')
 * @param {number} expiryMinutes - Minutes until expiry (default: 10)
 * @returns {object} - Stored PIN data
 */
export function storePIN(email, pin, type, expiryMinutes = 10) {
  const key = `${email}:${type}`
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)
  
  const data = {
    email,
    pin,
    type,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    createdAt: new Date()
  }
  
  pinStore.set(key, data)
  
  // Auto-cleanup after expiry
  setTimeout(() => {
    pinStore.delete(key)
  }, expiryMinutes * 60 * 1000)
  
  return data
}

/**
 * Verify a PIN
 * @param {string} email - User email
 * @param {string} pin - PIN to verify
 * @param {string} type - PIN type
 * @returns {object} - Verification result
 */
export function verifyPIN(email, pin, type) {
  const key = `${email}:${type}`
  const stored = pinStore.get(key)
  
  if (!stored) {
    return {
      success: false,
      error: 'PIN not found or expired'
    }
  }
  
  // Check expiry
  if (new Date() > stored.expiresAt) {
    pinStore.delete(key)
    return {
      success: false,
      error: 'PIN has expired'
    }
  }
  
  // Check max attempts
  if (stored.attempts >= stored.maxAttempts) {
    pinStore.delete(key)
    return {
      success: false,
      error: 'Maximum attempts exceeded'
    }
  }
  
  // Increment attempts
  stored.attempts++
  
  // Verify PIN
  if (stored.pin !== pin) {
    return {
      success: false,
      error: 'Invalid PIN',
      attemptsLeft: stored.maxAttempts - stored.attempts
    }
  }
  
  // Success - delete PIN to prevent reuse
  pinStore.delete(key)
  
  return {
    success: true,
    message: 'PIN verified successfully'
  }
}

/**
 * Get PIN info (for testing/debugging)
 * @param {string} email 
 * @param {string} type 
 * @returns {object|null}
 */
export function getPINInfo(email, type) {
  const key = `${email}:${type}`
  return pinStore.get(key) || null
}

/**
 * Delete a PIN
 * @param {string} email 
 * @param {string} type 
 */
export function deletePIN(email, type) {
  const key = `${email}:${type}`
  pinStore.delete(key)
}

/**
 * Clean up expired PINs (manual cleanup)
 */
export function cleanupExpiredPINs() {
  const now = new Date()
  let cleaned = 0
  
  for (const [key, data] of pinStore.entries()) {
    if (now > data.expiresAt) {
      pinStore.delete(key)
      cleaned++
    }
  }
  
  return cleaned
}
