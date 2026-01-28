import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const baseUrl = process.env.KALEIDO_REST_API || 'https://e1i8a4oupg-eiqgy1f70s-connect.eu1-azure-ws.kaleido.io/'
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
    const signer = process.env.KALEIDO_SIGNER || 'e1ggy1f70s-admin'
    
    const testData = body || {
      id: `test_${Date.now()}`,
      name: 'Test Product',
      origin: 'Test Origin',
      category: 'Test',
      manufacturer: 'Test Mfg',
      mfgDate: new Date().toISOString(),
      expiryDate: '',
    }

    const txId = `traceroot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const payload = {
      headers: {
        type: 'SendTransaction',
        channel: channel,
        chaincode: chaincode,
        signer: signer,
        useGateway: true,
        endorsingOrgs: []
      },
      func: 'RegisterProduct',
      args: [
        testData.id || txId,
        testData.name || 'Unknown Product',
        testData.origin || 'Unknown',
        testData.category || 'General',
        testData.manufacturer || 'Unknown',
        testData.mfgDate || new Date().toISOString(),
        testData.expiryDate || '',
        JSON.stringify({
          ...testData,
          submittedAt: new Date().toISOString(),
          txId: txId
        })
      ]
    }

    console.log('📤 Sending to Kaleido:', {
      url: `${baseUrl}transactions`,
      payload: JSON.stringify(payload, null, 2),
      hasAuth: !!authHeader
    })

    const response = await fetch(`${baseUrl}transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    let responseBody = null
    try {
      responseBody = JSON.parse(responseText)
    } catch {
      responseBody = { raw: responseText }
    }

    console.log('📥 Kaleido Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseBody
    })

    return NextResponse.json({
      success: true,
      submitted: {
        txId,
        payload,
        timestamp: new Date().toISOString()
      },
      kaleido: {
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
        headers: Object.fromEntries(response.headers)
      },
      config: {
        baseUrl,
        channel,
        chaincode,
        signer,
        authHeaderLength: authHeader?.length || 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Test transaction error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
