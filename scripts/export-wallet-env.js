#!/usr/bin/env node
// Export Fabric wallet identity as base64 env vars for .env
// Usage: node scripts/export-wallet-env.js [--wallet ./wallet] [--user appUser]

const path = require('path')
const fs = require('fs')

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : (process.env[name.toUpperCase()] || def)
}

async function main() {
  const walletPath = arg('wallet', path.join(process.cwd(), 'wallet'))
  const userId = arg('user', process.env.HYPERLEDGER_USER_ID || 'appUser')

  let certPem, keyPem

  // Try fabric-network Wallets API first
  try {
    const { Wallets } = require('fabric-network')
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    const identity = await wallet.get(userId)
    if (!identity) throw new Error(`Identity '${userId}' not found in wallet at ${walletPath}`)
    certPem = identity.credentials.certificate
    keyPem = identity.credentials.privateKey
  } catch (e) {
    // Fallback: try direct JSON file read (wallet/<user>.id)
    const idFile = path.join(walletPath, `${userId}.id`)
    if (!fs.existsSync(idFile)) {
      console.error('❌ Unable to load identity via fabric-network and fallback file not found:', idFile)
      console.error('Provide a wallet with the app user identity or run your enroll script first.')
      process.exit(1)
    }
    const raw = fs.readFileSync(idFile, 'utf8')
    const json = JSON.parse(raw)
    certPem = json.credentials && json.credentials.certificate
    keyPem = json.credentials && json.credentials.privateKey
    if (!certPem || !keyPem) {
      console.error('❌ Wallet file found but missing credentials.certificate/privateKey')
      process.exit(1)
    }
  }

  const certB64 = Buffer.from(certPem, 'utf8').toString('base64')
  const keyB64 = Buffer.from(keyPem, 'utf8').toString('base64')

  console.log('HYPERLEDGER_IDENTITY_CERT_B64="' + certB64 + '"')
  console.log('HYPERLEDGER_IDENTITY_KEY_B64="' + keyB64 + '"')
}

main().catch((err) => {
  console.error('❌ export-wallet-env failed:', err.message)
  process.exit(1)
})
