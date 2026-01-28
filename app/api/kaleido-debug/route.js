import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    
    console.log('🔍 KALEIDO DEBUG: Testing transaction submission')
    
    const baseUrl = process.env.KALEIDO_REST_API?.replace(/\/$/, '')
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME || 'default-channel'
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME || 'traceroot'
    const signer = process.env.KALEIDO_SIGNER || 'e1ggy1f70s-admin'

    console.log('Config:', { baseUrl: baseUrl?.substring(0, 50), channel, chaincode, signer })

    if (!baseUrl || !authHeader) {
      return NextResponse.json({ error: 'Missing Kaleido config' }, { status: 400 })
    }

    // Try the actual payload format that's been tested
    const payload = {
      headers: {
        type: 'SendTransaction',
        channel: channel,
        chaincode: chaincode,
        signer: signer,
        useGateway: true
      },
      func: 'RegisterProduct',
      args: [
        'debug_' + Date.now(),
        'Debug Product',
        'Debug Origin',
        'Debug Category',
        'Debug Manufacturer',
        new Date().toISOString(),
        '',
        JSON.stringify({ debug: true, timestamp: new Date().toISOString() })
      ]
    }

    const https = await import('https')
    const agent = new https.Agent({ rejectUnauthorized: false })
    const url = `${baseUrl}transactions`

    console.log('\n📤 Submitting transaction to Kaleido...')
    console.log('URL:', url)
    console.log('Payload:', JSON.stringify(payload, null, 2))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Kaleido-From': signer
        },
        agent,
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseText = await res.text()
      console.log('\n📥 Response Status:', res.status, res.statusText)
      console.log('Response Headers:', {
        'content-type': res.headers.get('content-type'),
        'content-length': res.headers.get('content-length')
      })
      console.log('Response Body:', responseText)

      let responseBody
      try {
        responseBody = JSON.parse(responseText)
      } catch {
        responseBody = { raw: responseText }
      }

      // Extract transaction ID from different possible response formats
      const txId = 
        responseBody.transactionId ||
        responseBody.txid ||
        responseBody.id ||
        responseBody.result?.transactionId ||
        responseBody.result?.txid ||
        'UNKNOWN'

      console.log('Transaction ID extracted:', txId)

      return NextResponse.json({
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        transactionId: txId,
        fullResponse: responseBody,
        config: {
          channel,
          chaincode,
          signer,
          endpoint: url.substring(0, 80) + '...'
        }
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      console.error('❌ Fetch Error:', fetchError.message)
      console.error('Code:', fetchError.code)
      
      return NextResponse.json({
        error: 'Fetch failed',
        message: fetchError.message,
        code: fetchError.code,
        type: fetchError.name
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
