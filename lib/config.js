// Environment configuration and validation
export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Application
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  
  // Blockchain
  useRealBlockchain: process.env.USE_REAL_BLOCKCHAIN === 'true',
  blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || 'hyperledger',
}

// Required environment variables for production
const requiredEnvVars = {
  DATABASE_URL: 'MongoDB connection string is required',
  JWT_SECRET: 'JWT secret key is required for authentication',
}

// Validate environment variables
export function validateConfig() {
  const missing = []
  const errors = []

  for (const [key, message] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(key)
      errors.push(message)
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    errors,
  }
}

// Get a user-friendly error message
export function getConfigErrorMessage() {
  const validation = validateConfig()
  
  if (validation.isValid) {
    return null
  }

  return `
Missing required environment variables:
${validation.missing.map(v => `  - ${v}`).join('\n')}

Please set these in your Vercel project settings:
${validation.errors.map(e => `  • ${e}`).join('\n')}

For more information, see VERCEL_DEPLOYMENT.md
  `.trim()
}

export default config
