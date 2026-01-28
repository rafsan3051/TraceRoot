import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { method = 'RegisterProduct', args = [] } = await request.json()
    
    const baseUrl = process.env.KALEIDO_REST_API
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME
    const signer = process.env.KALEIDO_SIGNER

    if (!baseUrl || !authHeader || !channel || !chaincode) {
      return NextResponse.json({
        error: 'Missing configuration',
        missing: {
          baseUrl: !baseUrl,
          authHeader: !authHeader,
          channel: !channel,
          chaincode: !chaincode
        }
      }, { status: 400 })
    }

    // Build payload exactly as Kaleido documentation specifies
    const payload = {
      headers: {
        type: 'SendTransaction',
        channel,
        chaincode,
        signer,
        useGateway: true
      },
      func: method,
      args: args || []
    }

    console.log('🧪 Testing chaincode method:', {
      method,
      args: args.slice(0, 2),
      payload
    })

    const response = await fetch(`${baseUrl}transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload),
      timeout: 30000
    })

    const responseText = await response.text()
    let responseBody
    try {
      responseBody = JSON.parse(responseText)
    } catch {
      responseBody = { raw: responseText }
    }

    // Extract transaction ID if present
    let txId = null
    if (responseBody.transactionId) txId = responseBody.transactionId
    else if (responseBody.txid) txId = responseBody.txid
    else if (responseBody.id) txId = responseBody.id
    else if (responseBody.uuid) txId = responseBody.uuid
    else if (typeof responseBody === 'string') txId = responseBody

    const result = {
      method,
      success: response.ok || response.status === 202,
      status: {
        code: response.status,
        text: response.statusText
      },
      transactionId: txId,
      response: responseBody,
      config: {
        channel,
        chaincode,
        signer,
        method
      },
      suggestions: []
    }

    // Add helpful suggestions based on response
    if (response.status === 404) {
      result.suggestions.push('❌ Chaincode method not found')
      result.suggestions.push('Try: RegisterProduct, CreateProduct, WriteProduct, Or query available methods')
    } else if (response.status === 400) {
      result.suggestions.push('❌ Bad request - likely wrong argument format')
      result.suggestions.push('Check if method expects arguments in a specific format')
    } else if (response.status === 500) {
      result.suggestions.push('❌ Server error from Kaleido')
      result.suggestions.push('Check the response body for details')
    } else if (response.ok) {
      result.suggestions.push('✅ Method accepted')
      result.suggestions.push(`Transaction ID: ${txId}`)
      result.suggestions.push('View in explorer: ' + process.env.KALEIDO_EXPLORER + 'tx/' + txId)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Chaincode test error:', error)
    return NextResponse.json({
      error: error.message,
      type: error.constructor.name
    }, { status: 500 })
  }
}

export async function GET(request) {
  // Show available test methods
  const commonMethods = [
    { name: 'RegisterProduct', args: ['id', 'name', 'origin', 'category', 'mfg', 'date', 'expiry', 'details'] },
    { name: 'CreateProduct', args: ['id', 'name', 'origin', 'category'] },
    { name: 'WriteProduct', args: ['key', 'value'] },
    { name: 'Init', args: [] },
    { name: 'query', args: ['productId'] },
    { name: 'invoke', args: ['key', 'value'] }
  ]

  return NextResponse.json({
    description: 'Test individual chaincode methods',
    usage: 'POST /api/test-method with { "method": "MethodName", "args": [...] }',
    commonMethods,
    example: {
      method: 'RegisterProduct',
      args: ['PROD_001', 'Test Product', 'USA', 'Electronics', 'TestCorp', '2024-01-01T00:00:00Z', '2025-01-01T00:00:00Z', 'Test data']
    }
  })
}
