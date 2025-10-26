#!/usr/bin/env node
/* Simple Fabric connectivity test for TraceRoot */

(async () => {
  const fs = require('fs')
  const path = require('path')

  const { Gateway, Wallets } = require('fabric-network')

  const ccpPath = process.env.HYPERLEDGER_CONNECTION_PROFILE || path.join(process.cwd(), 'fabric-network', 'connection-profile.json')
  const walletPath = process.env.HYPERLEDGER_WALLET_PATH || path.join(process.cwd(), 'wallet')
  const userId = process.env.HYPERLEDGER_USER_ID || 'appUser'
  const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'tracerootchannel'
  const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'

  console.log('--- TraceRoot Fabric Connectivity Test ---')

  if (!fs.existsSync(ccpPath)) {
    console.error('❌ Connection profile not found:', ccpPath)
    process.exit(1)
  }

  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))
  const wallet = await Wallets.newFileSystemWallet(walletPath)

  const identity = await wallet.get(userId)
  if (!identity) {
    console.error(`❌ Identity '${userId}' not found in wallet:`, walletPath)
    console.log('   Enroll user first (admin/appUser) before testing.')
    process.exit(1)
  }

  const gateway = new Gateway()
  try {
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true }
    })

    const network = await gateway.getNetwork(channel)
    const contract = network.getContract(chaincode)

    console.log('✅ Connected to Fabric. Attempting a read...')
    try {
      const result = await contract.evaluateTransaction('GetProduct', 'sample-product')
      console.log('Read result:', result.toString())
    } catch (e) {
      console.log('Read failed (expected if no ledger state):', e.message)
    }
  } catch (err) {
    console.error('❌ Fabric connectivity failed:', err.message)
    process.exit(1)
  } finally {
    gateway.disconnect()
  }

  console.log('✅ Fabric connectivity test completed.')
  process.exit(0)
})()
