import { NextResponse } from 'next/server'

export async function GET(request) {
  // For security, only show non-sensitive parts of config
  const config = {
    nodeEnv: process.env.NODE_ENV,
    kaleido: {
      restApiExists: !!process.env.KALEIDO_REST_API,
      restApiStart: process.env.KALEIDO_REST_API?.substring(0, 60),
      authHeaderExists: !!process.env.KALEIDO_AUTH_HEADER,
      authHeaderLength: process.env.KALEIDO_AUTH_HEADER?.length || 0,
      signer: process.env.KALEIDO_SIGNER,
      peerId: process.env.KALEIDO_PEER_ID,
      appId: process.env.KALEIDO_APP_ID,
      explorer: process.env.KALEIDO_EXPLORER?.substring(0, 80)
    },
    hyperledger: {
      channel: process.env.HYPERLEDGER_CHANNEL_NAME,
      chaincode: process.env.HYPERLEDGER_CHAINCODE_NAME,
      namespace: process.env.HYPERLEDGER_NAMESPACE,
      mspId: process.env.HYPERLEDGER_MSP_ID
    },
    blockchain: {
      useRealBlockchain: process.env.USE_REAL_BLOCKCHAIN === 'true',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'missing'
    }
  }

  return NextResponse.json(config)
}
