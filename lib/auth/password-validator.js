/**
 * Password validation and strength checking
 */

/**
 * Validate password meets security requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 * 
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = []
  
  if (!password) {
    return {
      valid: false,
      errors: ['Password is required']
    }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get password strength score (0-100)
 * @param {string} password - Password to score
 * @returns {number} Strength score
 */
export function getPasswordStrength(password) {
  let score = 0
  
  if (!password) return 0
  
  // Length scoring
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  
  // Character type scoring
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15
  
  return Math.min(100, score)
}

/**
 * Get password strength label
 * @param {number} score - Strength score (0-100)
 * @returns {object} { label: string, color: string }
 */
export function getStrengthLabel(score) {
  if (score < 20) return { label: 'Very Weak', color: 'red' }
  if (score < 40) return { label: 'Weak', color: 'orange' }
  if (score < 60) return { label: 'Fair', color: 'yellow' }
  if (score < 80) return { label: 'Good', color: 'lightgreen' }
  return { label: 'Strong', color: 'green' }
}
