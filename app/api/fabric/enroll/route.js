// Server-only API to enroll CA admin and app user into wallet
// Protects against accidental use in production via env gate

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }
  // Optional shared key to prevent arbitrary calls
  const key = process.env.FABRIC_ENROLL_KEY
  const incoming = req.headers.get('x-enroll-key')
  if (key && key !== incoming) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Dynamic import to keep client bundle clean
    const path = (await import('path')).default
    const fs = await import('fs')

    const { default: FabricCAServices } = await import('fabric-ca-client')
    const { Wallets } = await import('fabric-network')

    const ccpPath = process.env.HYPERLEDGER_CONNECTION_PROFILE || path.join(process.cwd(), 'fabric-network', 'connection-profile.json')
    if (!fs.existsSync(ccpPath)) {
      return NextResponse.json({ error: `Connection profile not found at ${ccpPath}` }, { status: 400 })
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))

    const walletPath = process.env.HYPERLEDGER_WALLET_PATH || path.join(process.cwd(), 'wallet')
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    const adminId = process.env.HYPERLEDGER_CA_ADMIN_ID || 'admin'
    const adminSecret = process.env.HYPERLEDGER_CA_ADMIN_SECRET || 'adminpw'
    const mspId = process.env.HYPERLEDGER_MSP_ID || 'Org1MSP'
    const userId = process.env.HYPERLEDGER_USER_ID || 'appUser'

    // Enroll admin if missing
    let didEnrollAdmin = false
    let adminIdentity = await wallet.get(adminId)
    if (!adminIdentity) {
      const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
      const caTLSCACerts = caInfo.tlsCACerts.pem
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)
      const enrollment = await ca.enroll({ enrollmentID: adminId, enrollmentSecret: adminSecret })
      const x509Identity = {
        credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
        mspId,
        type: 'X.509'
      }
      await wallet.put(adminId, x509Identity)
      didEnrollAdmin = true
      adminIdentity = x509Identity
    }

    // Register + enroll user if missing
    let didEnrollUser = false
    if (!await wallet.get(userId)) {
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
      const adminUser = await provider.getUserContext(adminIdentity, adminId)
      const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]]
      const caTLSCACerts = caInfo.tlsCACerts.pem
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)
      const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userId, role: 'client' }, adminUser)
      const enrollment = await ca.enroll({ enrollmentID: userId, enrollmentSecret: secret })
      const x509Identity = {
        credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
        mspId,
        type: 'X.509'
      }
      await wallet.put(userId, x509Identity)
      didEnrollUser = true
    }

    return NextResponse.json({ ok: true, admin: didEnrollAdmin, user: didEnrollUser })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
