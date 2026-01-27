/**
 * Kaleido Fabric Enrollment Script
 * Enrolls admin and app users with Kaleido CA
 */

const { Wallets } = require('fabric-network')
const FabricCAServices = require('fabric-ca-client')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const connectionProfilePath = path.resolve(__dirname, '../fabric-network/connection-profile-kaleido.json')
const walletPath = path.resolve(__dirname, '../wallet')
const APP_ID = process.env.KALEIDO_APP_ID
const APP_SECRET = process.env.KALEIDO_APP_SECRET

async function enrollAdmin() {
  try {
    console.log('🔐 Enrolling Admin with Kaleido CA...')

    // Load connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8')
    const ccp = JSON.parse(ccpJSON)

    // Get CA info
    const caInfo = ccp.certificateAuthorities['ca-u0d5lacfnl']
    // Inject app credentials into CA URL if provided
    let caUrl = caInfo.url
    if (APP_ID && APP_SECRET) {
      caUrl = caUrl.replace('https://', `https://${APP_ID}:${APP_SECRET}@`)
    } else {
      console.warn('⚠️  KALEIDO_APP_ID/KALEIDO_APP_SECRET not set. CA may reject requests.')
    }
    const ca = new FabricCAServices(caUrl, { 
      trustedRoots: [], 
      verify: false 
    }, caInfo.caName)

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    // Check if admin already exists
    const adminIdentity = await wallet.get('admin')
    if (adminIdentity) {
      console.log('✅ Admin already enrolled')
      return true
    }

    // Enroll admin
    // NOTE: Get these credentials from Kaleido dashboard
    console.log('📝 Admin credentials needed from Kaleido dashboard')
    console.log('   Go to: CA Node -> Identities -> Get admin credentials')
    
    const enrollment = await ca.enroll({
      enrollmentID: process.env.FABRIC_ADMIN_ID || 'admin',
      enrollmentSecret: process.env.FABRIC_ADMIN_SECRET || 'adminpw' // Set FABRIC_ADMIN_SECRET in .env.local
    })

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: process.env.HYPERLEDGER_MSP_ID || 'TraceRoot-MSP',
      type: 'X.509',
    }

    await wallet.put('admin', x509Identity)
    console.log('✅ Admin enrolled successfully')
    return true

  } catch (error) {
    console.error('❌ Failed to enroll admin:', error.message)
    return false
  }
}

async function registerAndEnrollUser(username = 'appUser') {
  try {
    console.log(`🔐 Registering and enrolling user: ${username}`)

    // Load connection profile
    const ccpJSON = fs.readFileSync(connectionProfilePath, 'utf8')
    const ccp = JSON.parse(ccpJSON)

    // Get CA info
    const caInfo = ccp.certificateAuthorities['ca-u0d5lacfnl']
    let caUrl2 = caInfo.url
    if (APP_ID && APP_SECRET) {
      caUrl2 = caUrl2.replace('https://', `https://${APP_ID}:${APP_SECRET}@`)
    }
    const ca = new FabricCAServices(caUrl2, { 
      trustedRoots: [], 
      verify: false 
    }, caInfo.caName)

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    // Check if user already exists
    const userIdentity = await wallet.get(username)
    if (userIdentity) {
      console.log(`✅ User ${username} already enrolled`)
      return true
    }

    // Get admin identity
    const adminIdentity = await wallet.get('admin')
    if (!adminIdentity) {
      console.log('❌ Admin identity not found. Run enrollAdmin first.')
      return false
    }

    // Build admin user object
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
    const adminUser = await provider.getUserContext(adminIdentity, 'admin')

    // Register the user
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID: username,
      role: 'client'
    }, adminUser)

    // Enroll the user
    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret
    })

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: process.env.HYPERLEDGER_MSP_ID || 'TraceRoot-MSP',
      type: 'X.509',
    }

    await wallet.put(username, x509Identity)
    console.log(`✅ User ${username} enrolled successfully`)
    return true

  } catch (error) {
    console.error(`❌ Failed to enroll user ${username}:`, error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🚀 Starting Kaleido enrollment process...\n')

    // Step 1: Enroll admin
    const adminSuccess = await enrollAdmin()
    if (!adminSuccess) {
      console.log('\n❌ Enrollment failed. Please check your Kaleido credentials.')
      process.exit(1)
    }

    console.log('')

    // Step 2: Register and enroll app user
    const userSuccess = await registerAndEnrollUser('appUser')
    if (!userSuccess) {
      console.log('\n❌ User enrollment failed.')
      process.exit(1)
    }

    console.log('\n✅ Enrollment complete! Ready to deploy chaincode.')
    console.log('\n📋 Next steps:')
    console.log('   1. Deploy chaincode: npm run fabric:chaincode:deploy')
    console.log('   2. Start your app: npm run dev')

  } catch (error) {
    console.error('❌ Enrollment error:', error)
    process.exit(1)
  }
}

main()
