import { NextResponse } from 'next/server'

export async function GET(request) {
  console.log('🔍 Running Kaleido Diagnostics...')

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      useRealBlockchain: process.env.USE_REAL_BLOCKCHAIN === 'true',
      kaleido: {
        restApi: process.env.KALEIDO_REST_API ? '✓ Configured' : '✗ Missing',
        authHeader: process.env.KALEIDO_AUTH_HEADER ? '✓ Configured' : '✗ Missing',
        signer: process.env.KALEIDO_SIGNER || 'Not set',
        channelName: process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel',
        chaincodeName: process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot',
      }
    },
    tests: {}
  }

  // Test 1: Check if Kaleido endpoint is reachable
  if (process.env.KALEIDO_REST_API && process.env.KALEIDO_AUTH_HEADER) {
    try {
      const baseUrl = process.env.KALEIDO_REST_API.replace(/\/$/, '')
      const testUrl = `${baseUrl}/transactions`
      
      console.log('📡 Testing Kaleido endpoint:', testUrl)
      
      const https = await import('https')
      const agent = new https.Agent({ 
        rejectUnauthorized: false,
        keepAlive: true 
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      try {
        const res = await fetch(testUrl, {
          method: 'OPTIONS',
          headers: {
            'Authorization': process.env.KALEIDO_AUTH_HEADER,
            'Content-Type': 'application/json'
          },
          agent,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (res.ok || res.status === 405) { // 405 Method Not Allowed is OK for OPTIONS
          diagnostics.tests.kaleidoConnectivity = {
            status: '✓ REACHABLE',
            httpStatus: res.status,
            message: 'Kaleido endpoint is accessible'
          }
          console.log('✓ Kaleido endpoint is reachable')
        } else {
          diagnostics.tests.kaleidoConnectivity = {
            status: '⚠ UNEXPECTED STATUS',
            httpStatus: res.status,
            message: `Got status ${res.status}. Check credentials.`
          }
          console.warn('⚠ Unexpected status from Kaleido:', res.status)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        let errorType = 'UNKNOWN'
        let suggestion = ''
        
        if (fetchError.name === 'AbortError') {
          errorType = 'TIMEOUT'
          suggestion = 'Network is very slow or Kaleido is unresponsive'
        } else if (fetchError.code === 'ENOTFOUND') {
          errorType = 'DNS_FAILED'
          suggestion = 'Check KALEIDO_REST_API URL - hostname cannot be resolved'
        } else if (fetchError.code === 'ECONNREFUSED') {
          errorType = 'CONNECTION_REFUSED'
          suggestion = 'Kaleido endpoint is down or inactive'
        } else if (fetchError.code === 'ENETUNREACH') {
          errorType = 'NETWORK_UNREACHABLE'
          suggestion = 'VPN/Firewall blocking access to *.kaleido.io'
        } else if (fetchError.message.includes('fetch failed')) {
          errorType = 'NETWORK_ERROR'
          suggestion = 'VPN/Firewall blocking or network connectivity issue'
        }
        
        diagnostics.tests.kaleidoConnectivity = {
          status: '✗ UNREACHABLE',
          errorType,
          suggestion,
          message: fetchError.message
        }
        
        console.error('✗ Kaleido endpoint unreachable:', errorType)
        console.error('   Suggestion:', suggestion)
      }
    } catch (error) {
      diagnostics.tests.kaleidoConnectivity = {
        status: '✗ ERROR',
        message: error.message
      }
      console.error('✗ Test error:', error.message)
    }
  } else {
    diagnostics.tests.kaleidoConnectivity = {
      status: '⚠ SKIPPED',
      message: 'Kaleido config incomplete - cannot test'
    }
  }

  // Test 2: Check MongoDB connectivity
  try {
    const prisma = (await import('../../../lib/prisma')).default
    const user = await prisma.user.findFirst({ take: 1 })
    diagnostics.tests.mongoDbConnectivity = {
      status: '✓ CONNECTED',
      message: 'MongoDB is accessible'
    }
    console.log('✓ MongoDB connection OK')
  } catch (error) {
    diagnostics.tests.mongoDbConnectivity = {
      status: '✗ ERROR',
      message: error.message
    }
    console.error('✗ MongoDB connection failed:', error.message)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
