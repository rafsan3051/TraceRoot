/**
 * Test Kaleido Connection
 */

const { Gateway, Wallets } = require('fabric-network')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env' })

const connectionProfilePath = path.resolve(__dirname, '../fabric-network/connection-profile-kaleido.json')
const walletPath = path.resolve(__dirname, '../wallet')
const APP_ID = process.env.KALEIDO_APP_ID
const APP_SECRET = process.env.KALEIDO_APP_SECRET

async function testConnection() {
  try {
    console.log('🧪 Testing Kaleido connection...\n')

    // Check connection profile
    if (!fs.existsSync(connectionProfilePath)) {
      console.log('❌ Connection profile not found:', connectionProfilePath)
      process.exit(1)
    }
    console.log('✅ Connection profile found')

    // Load connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8')
    const ccp = JSON.parse(ccpJSON)
    // Inject app credentials into peer/orderer URLs for Kaleido
    if (APP_ID && APP_SECRET) {
      for (const peerKey of Object.keys(ccp.peers || {})) {
        ccp.peers[peerKey].url = ccp.peers[peerKey].url.replace('https://', `https://${APP_ID}:${APP_SECRET}@`)
      }
      for (const ordKey of Object.keys(ccp.orderers || {})) {
        ccp.orderers[ordKey].url = ccp.orderers[ordKey].url.replace('https://', `https://${APP_ID}:${APP_SECRET}@`)
      }
      const caKey = Object.keys(ccp.certificateAuthorities || {})[0]
      if (caKey) {
        ccp.certificateAuthorities[caKey].url = ccp.certificateAuthorities[caKey].url.replace('https://', `https://${APP_ID}:${APP_SECRET}@`)
      }
    } else {
      console.warn('⚠️  KALEIDO_APP_ID/KALEIDO_APP_SECRET not set. Set them in .env')
    }
    console.log('✅ Connection profile loaded')
    console.log('   Organizations:', Object.keys(ccp.organizations))
    console.log('   Peers:', Object.keys(ccp.peers))
    console.log('   CAs:', Object.keys(ccp.certificateAuthorities))

    // Check wallet
    if (!fs.existsSync(walletPath)) {
      console.log('⚠️  Wallet not found. Run: npm run fabric:enroll:kaleido')
      return
    }
    console.log('✅ Wallet found')

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    const identity = await wallet.get('admin')
    
    if (!identity) {
      console.log('⚠️  Admin identity not found. Run: npm run fabric:enroll:kaleido')
      return
    }
    console.log('✅ Admin identity found')

    // Try to connect
    const gateway = new Gateway()
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: false }
    })
    console.log('✅ Connected to Kaleido gateway')

    await gateway.disconnect()
    console.log('\n✅ All tests passed! Ready to use Kaleido.')

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Check your .env configuration')
    console.log('   2. Verify Kaleido nodes are running')
    console.log('   3. Ensure you ran: npm run fabric:enroll:kaleido')
  }
}

testConnection()
