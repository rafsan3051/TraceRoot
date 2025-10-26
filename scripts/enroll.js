#!/usr/bin/env node
/*
  TraceRoot - Hyperledger Fabric Enrollment Utility
  - Enrolls CA admin (default: admin/adminpw)
  - Registers and enrolls app user (HYPERLEDGER_USER_ID)
*/

const fs = require('fs')
const path = require('path')
const FabricCAServices = require('fabric-ca-client')
const { Wallets } = require('fabric-network')

function env(name, def) { return process.env[name] || def }

async function loadCCP() {
  const ccpPath = env('HYPERLEDGER_CONNECTION_PROFILE', path.join(process.cwd(), 'fabric-network', 'connection-profile.json'))
  if (!fs.existsSync(ccpPath)) throw new Error(`Connection profile not found at ${ccpPath}`)
  return JSON.parse(fs.readFileSync(ccpPath, 'utf8'))
}

async function getWallet() {
  const walletPath = env('HYPERLEDGER_WALLET_PATH', path.join(process.cwd(), 'wallet'))
  return Wallets.newFileSystemWallet(walletPath)
}

async function enrollAdmin() {
  const wallet = await getWallet()
  const adminId = env('HYPERLEDGER_CA_ADMIN_ID', 'admin')
  const adminSecret = env('HYPERLEDGER_CA_ADMIN_SECRET', 'adminpw')

  const existing = await wallet.get(adminId)
  if (existing) {
    console.log(`Admin '${adminId}' already enrolled.`)
    return
  }

  const ccp = await loadCCP()
  const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
  const caTLSCACerts = caInfo.tlsCACerts.pem
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

  const enrollment = await ca.enroll({ enrollmentID: adminId, enrollmentSecret: adminSecret })
  const x509Identity = {
    credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
    mspId: env('HYPERLEDGER_MSP_ID', 'Org1MSP'),
    type: 'X.509'
  }
  await wallet.put(adminId, x509Identity)
  console.log(`✅ Enrolled admin '${adminId}'`)
}

async function registerAndEnrollUser() {
  const wallet = await getWallet()
  const userId = env('HYPERLEDGER_USER_ID', 'appUser')

  if (await wallet.get(userId)) {
    console.log(`User '${userId}' already enrolled.`)
    return
  }

  const adminId = env('HYPERLEDGER_CA_ADMIN_ID', 'admin')
  const adminIdentity = await wallet.get(adminId)
  if (!adminIdentity) throw new Error(`Admin '${adminId}' not in wallet. Enroll admin first.`)

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
  const adminUser = await provider.getUserContext(adminIdentity, adminId)

  const ccp = await loadCCP()
  const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
  const caTLSCACerts = caInfo.tlsCACerts.pem
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

  const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userId, role: 'client' }, adminUser)
  const enrollment = await ca.enroll({ enrollmentID: userId, enrollmentSecret: secret })

  const x509Identity = {
    credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
    mspId: env('HYPERLEDGER_MSP_ID', 'Org1MSP'),
    type: 'X.509'
  }
  await wallet.put(userId, x509Identity)
  console.log(`✅ Enrolled user '${userId}'`)
}

(async () => {
  try {
    await enrollAdmin()
    await registerAndEnrollUser()
    console.log('🎉 Enrollment complete.')
  } catch (e) {
    console.error('Enrollment failed:', e.message)
    process.exit(1)
  }
})()
