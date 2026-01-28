import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { payload, custom = false } = await request.json()

    const baseUrl = process.env.KALEIDO_REST_API
    const authHeader = process.env.KALEIDO_AUTH_HEADER

    if (!payload) {
      return NextResponse.json({
        error: 'Must provide payload in request body',
        example: {
          payload: {
            headers: {
              type: 'SendTransaction',
              channel: 'default-channel',
              chaincode: 'traceroot',
              signer: 'e1ggy1f70s-admin',
              useGateway: true,
              endorsingOrgs: []
            },
            func: 'RegisterProduct',
            args: ['id', 'name', 'origin', 'category', 'mfg', 'date', 'expiry', 'details']
          },
          custom: false
        }
      }, { status: 400 })
    }

    console.log('📤 Submitting custom payload to Kaleido:', {
      endpoint: baseUrl + 'transactions',
      payload,
      custom
    })

    const response = await fetch(`${baseUrl}transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    let responseBody
    try {
      responseBody = JSON.parse(responseText)
    } catch {
      responseBody = { raw: responseText }
    }

    console.log('📥 Kaleido Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseBody
    })

    // Attempt to extract transaction ID from various possible response formats
    let txId = null
    if (responseBody.transactionId) txId = responseBody.transactionId
    else if (responseBody.txid) txId = responseBody.txid
    else if (responseBody.id) txId = responseBody.id
    else if (responseBody.uuid) txId = responseBody.uuid
    else if (responseBody.result?.transactionId) txId = responseBody.result.transactionId
    else if (typeof responseBody === 'string' && responseBody.length > 5) txId = responseBody

    const result = {
      submitted: {
        timestamp: new Date().toISOString(),
        payload,
        custom
      },
      kaleido: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        body: responseBody,
        extractedTxId: txId
      },
      analysis: {
        accepted: response.ok || response.status === 202,
        hasErrorInfo: !!responseBody.error || !!responseBody.message,
        responseType: typeof responseBody
      }
    }

    return NextResponse.json(result, { status: response.ok ? 200 : response.status })

  } catch (error) {
    console.error('Custom payload error:', error)
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({
    description: 'Submit custom payloads directly to Kaleido for testing',
    usage: 'POST /api/submit-payload with { "payload": { ... }, "custom": true/false }',
    payloadFormats: {
      basic: {
        headers: {
          type: 'SendTransaction',
          channel: 'default-channel',
          chaincode: 'traceroot',
          signer: 'e1ggy1f70s-admin',
          useGateway: true,
          endorsingOrgs: []
        },
        func: 'RegisterProduct',
        args: ['arg1', 'arg2', 'arg3']
      },
      withMSP: {
        headers: {
          type: 'SendTransaction',
          channel: 'default-channel',
          chaincode: 'traceroot',
          signer: 'e1ggy1f70s-admin',
          useGateway: true,
          endorsingOrgs: ['Org1MSP']
        },
        func: 'RegisterProduct',
        args: ['arg1', 'arg2']
      },
      queryFormat: {
        headers: {
          type: 'Query',
          channel: 'default-channel',
          chaincode: 'traceroot'
        },
        func: 'GetProduct',
        args: ['productId']
      }
    },
    testCases: {
      simple: 'Test with minimal arguments',
      allArgs: 'Test with all 8 arguments (product registration)',
      differentFunction: 'Try CreateProduct or WriteProduct if RegisterProduct fails'
    }
  })
}
