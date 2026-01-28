import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    
    console.log('🧪 SIMPLE TEST: Testing Kaleido with minimal transaction')
    
    const baseUrl = process.env.KALEIDO_REST_API?.replace(/\/$/, '')
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
    const signer = process.env.KALEIDO_SIGNER || 'e1ggy1f70s-admin'

    if (!baseUrl || !authHeader) {
      return NextResponse.json({ error: 'Missing Kaleido config' }, { status: 400 })
    }

    // Test 1: Try simple invoke
    console.log('\n📤 TEST 1: Simple invoke with minimal args')
    const simplePayload = {
      headers: {
        type: 'SendTransaction',
        channel: channel,
        chaincode: chaincode,
        signer: signer,
        useGateway: true
      },
      func: 'RegisterProduct',
      args: ['test_id_' + Date.now(), 'Test Product', 'Test Origin', 'Test Category']
    }

    const https = await import('https')
    const agent = new https.Agent({ rejectUnauthorized: false })
    const url = `${baseUrl}transactions`

    console.log('URL:', url)
    console.log('Payload:', JSON.stringify(simplePayload, null, 2))

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Kaleido-From': signer
      },
      agent,
      body: JSON.stringify(simplePayload)
    })

    const responseText = await res.text()
    const responseBody = (() => {
      try {
        return JSON.parse(responseText)
      } catch {
        return { raw: responseText }
      }
    })()

    console.log('Response Status:', res.status)
    console.log('Response:', responseBody)

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      response: responseBody,
      test: 'simple_invoke'
    })
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message)
    console.error('Code:', error.code)
    console.error('Details:', error)
    
    return NextResponse.json({
      error: error.message,
      code: error.code,
      type: error.name
    }, { status: 500 })
  }
}
