/**
 * Test TraceRoot Chaincode via Fabric SDK
 * Use this for Standard Blockchain Service (not FireFly)
 */

require('dotenv').config({ path: '.env' })
const { Gateway, Wallets } = require('fabric-network')
const fs = require('fs')
const path = require('path')

const connectionProfilePath = path.resolve(__dirname, '../fabric-network/connection-profile-kaleido.json')
const walletPath = path.resolve(__dirname, '../wallet')
const channelName = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
const chaincodeName = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'

async function testChaincode() {
  try {
    const fn = process.argv[2] || 'initLedger'
    const args = process.argv.slice(3)
    
    console.log(`🧪 Testing chaincode function: ${fn}`)
    console.log(`   Args: ${JSON.stringify(args)}`)
    
    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    
    // Check for identity
    const identity = await wallet.get('admin')
    if (!identity) {
      console.log('❌ Admin identity not found. Run: npm run kaleido:enroll')
      process.exit(1)
    }
    
    // Load connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8')
    const ccp = JSON.parse(ccpJSON)
    
    // Connect to gateway
    const gateway = new Gateway()
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: false }
    })
    
    console.log('✅ Connected to gateway')
    
    // Get network and contract
    const network = await gateway.getNetwork(channelName)
    const contract = network.getContract(chaincodeName)
    
    console.log(`✅ Got contract: ${chaincodeName} on channel: ${channelName}`)
    
    // Submit transaction
    console.log(`📤 Calling ${fn}...`)
    const result = await contract.submitTransaction(fn, ...args)
    
    console.log('✅ Transaction submitted successfully!')
    console.log('📦 Result:', result.toString())
    
    await gateway.disconnect()
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.endorsements) {
      console.error('Endorsement errors:', error.endorsements)
    }
    process.exit(1)
  }
}

testChaincode()
