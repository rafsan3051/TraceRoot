/**
 * Deploy TraceRoot Chaincode to Kaleido
 */

const { Gateway, Wallets } = require('fabric-network')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env' })

const connectionProfilePath = path.resolve(__dirname, '../fabric-network/connection-profile-kaleido.json')
const walletPath = path.resolve(__dirname, '../wallet')
const channelName = process.env.HYPERLEDGER_CHANNEL_NAME || 'tracerootchannel'
const chaincodeName = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
const APP_ID = process.env.KALEIDO_APP_ID
const APP_SECRET = process.env.KALEIDO_APP_SECRET

async function deployChaincode() {
  try {
    console.log('📦 Deploying chaincode to Kaleido...\n')

    // Load connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8')
    const ccp = JSON.parse(ccpJSON)
    // Inject app credentials
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
    }

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    // Check for admin identity
    const identity = await wallet.get('admin')
    if (!identity) {
      console.log('❌ Admin identity not found. Run: npm run fabric:enroll:kaleido')
      process.exit(1)
    }

    // Connect to gateway
    const gateway = new Gateway()
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: false }
    })

    console.log('✅ Connected to Kaleido network')

    // Get channel
    const network = await gateway.getNetwork(channelName)
    console.log(`✅ Connected to channel: ${channelName}`)

    console.log('\n📝 Chaincode deployment info:')
    console.log('   Channel:', channelName)
    console.log('   Chaincode:', chaincodeName)
    console.log('   Wallet:', walletPath)
    console.log('\n⚠️  Note: Deploy chaincode using Kaleido dashboard:')
    console.log('   1. Go to Kaleido Dashboard')
    console.log('   2. Click "Smart Contracts" or "Chaincode"')
    console.log('   3. Upload your chaincode from: ./chaincode/traceroot')
    console.log('   4. Set chaincode name: traceroot')
    console.log('   5. Deploy to channel: tracerootchannel')

    await gateway.disconnect()

  } catch (error) {
    console.error('❌ Deployment error:', error.message)
    process.exit(1)
  }
}

deployChaincode()
