import { NextResponse } from 'next/server'

export async function GET(request) {
  const baseUrl = process.env.KALEIDO_REST_API || ''
  const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
  const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
  const explorer = process.env.KALEIDO_EXPLORER || ''
  
  // Test all possible endpoints
  const endpoints = [
    { name: 'transactions', desc: 'Submit and query transactions' },
    { name: 'status', desc: 'Get blockchain status' },
    { name: 'receipts', desc: 'Get transaction receipts' },
    { name: 'blocks', desc: 'Get block information' },
    { name: 'query', desc: 'Query chaincode' },
    { name: 'invoke', desc: 'Invoke chaincode' }
  ]

  const testResults = {}
  
  // Test connectivity to each endpoint
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.name}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': process.env.KALEIDO_AUTH_HEADER || '',
        }
      })
      testResults[endpoint.name] = {
        status: response.status,
        available: response.status < 500,
        desc: endpoint.desc
      }
    } catch (err) {
      testResults[endpoint.name] = {
        error: err.message,
        available: false,
        desc: endpoint.desc
      }
    }
  }

  return NextResponse.json({
    blockchain: {
      channel,
      chaincode,
      baseUrl: baseUrl.substring(0, 80) + (baseUrl.length > 80 ? '...' : ''),
      explorer: explorer.substring(0, 100) + (explorer.length > 100 ? '...' : '')
    },
    availableEndpoints: testResults,
    debugEndpoints: {
      'GET /api/status': 'Full system status',
      'POST /api/test-transaction': 'Submit test product transaction',
      'GET /api/query-blockchain': 'Query chaincode status',
      'GET /api/config-check': 'View configuration',
      'GET /api/diagnostics': 'Full diagnostics'
    },
    troubleshooting: {
      issue: 'Transactions submit but don\'t appear in explorer',
      checks: [
        '1. Verify chaincode "' + chaincode + '" is deployed on channel "' + channel + '"',
        '2. Check if RegisterProduct function exists in chaincode',
        '3. Verify signer (${KALEIDO_SIGNER}) has invoke permissions',
        '4. Check if endorsement policies allow the transaction',
        '5. Test with POST /api/test-transaction to see Kaleido response',
        '6. Look at server logs for detailed error messages'
      ]
    },
    timestamp: new Date().toISOString()
  })
}
