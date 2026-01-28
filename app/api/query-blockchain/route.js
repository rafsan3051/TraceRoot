import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const baseUrl = process.env.KALEIDO_REST_API || 'https://e1i8a4oupg-eiqgy1f70s-connect.eu1-azure-ws.kaleido.io/'
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
    
    // Try to query the chaincode to see if it exists and responds
    const queryPayload = {
      headers: {
        type: 'SendTransaction',
        channel: channel,
        chaincode: chaincode,
        signer: process.env.KALEIDO_SIGNER || 'e1ggy1f70s-admin'
      },
      func: 'QueryProduct',
      args: ['test_query_' + Date.now()]
    }

    console.log('🔍 Testing Query to Kaleido...')

    const response = await fetch(`${baseUrl}transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(queryPayload)
    })

    const responseText = await response.text()
    let responseBody = null
    try {
      responseBody = JSON.parse(responseText)
    } catch {
      responseBody = { raw: responseText }
    }

    // Also try to get chaincode info
    const infoPayload = {
      headers: {
        type: 'GetStatus',
        channel: channel,
        chaincode: chaincode
      }
    }

    console.log('📊 Checking Chaincode Status...')
    const statusResponse = await fetch(`${baseUrl}status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(infoPayload)
    })

    const statusText = await statusResponse.text()
    let statusBody = null
    try {
      statusBody = JSON.parse(statusText)
    } catch {
      statusBody = { raw: statusText }
    }

    return NextResponse.json({
      query: {
        endpoint: `${baseUrl}transactions`,
        payload: queryPayload,
        response: {
          status: response.status,
          body: responseBody
        }
      },
      status: {
        endpoint: `${baseUrl}status`,
        response: {
          status: statusResponse.status,
          body: statusBody
        }
      },
      config: {
        channel,
        chaincode,
        baseUrl: baseUrl.substring(0, 80)
      }
    })

  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
