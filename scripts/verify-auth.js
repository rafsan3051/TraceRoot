import dotenv from 'dotenv'
dotenv.config()

const appId = process.env.KALEIDO_APP_ID
const appSecret = process.env.KALEIDO_APP_SECRET

if (!appId || !appSecret) {
  console.error('❌ Missing KALEIDO_APP_ID or KALEIDO_APP_SECRET')
  process.exit(1)
}

// Create base64 auth header
const credentials = `${appId}:${appSecret}`
const base64 = Buffer.from(credentials).toString('base64')
const authHeader = `Basic ${base64}`

console.log('Current KALEIDO_APP_ID:', appId)
console.log('Current KALEIDO_APP_SECRET:', appSecret)
console.log('Expected Auth Header:', authHeader)
console.log('')
console.log('.env Auth Header:', process.env.KALEIDO_AUTH_HEADER)
console.log('Match:', authHeader === process.env.KALEIDO_AUTH_HEADER ? '✅' : '❌')
