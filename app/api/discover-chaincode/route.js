import { NextResponse } from 'next/server'

const commonFunctions = [
  { name: 'RegisterProduct', args: ['id', 'name', 'origin', 'category', 'mfg', 'date', 'expiry', 'details'], desc: 'Register new product' },
  { name: 'CreateProduct', args: ['id', 'name', 'origin', 'category'], desc: 'Create product (simpler)' },
  { name: 'WriteProduct', args: ['key', 'value'], desc: 'Generic write' },
  { name: 'WriteAsset', args: ['key', 'value'], desc: 'Generic asset write' },
  { name: 'Invoke', args: ['key', 'value'], desc: 'Generic invoke' },
  { name: 'Init', args: [], desc: 'Initialize chaincode' },
  { name: 'Query', args: ['key'], desc: 'Query by key' },
  { name: 'GetProduct', args: ['id'], desc: 'Get specific product' },
  { name: 'ListProducts', args: [], desc: 'List all products' }
]

async function testFunction(baseUrl, authHeader, channel, chaincode, signer, func) {
  try {
    const payload = {
      headers: {
        type: 'SendTransaction',
        channel,
        chaincode,
        signer,
        useGateway: true,
        endorsingOrgs: []
      },
      func: func.name,
      args: func.args.slice(0, 3).map((arg, i) => `test_${i}_${Date.now()}`) || []
    }

    const response = await fetch(`${baseUrl}transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify(payload),
      timeout: 15000
    })

    const responseText = await response.text()
    let body
    try {
      body = JSON.parse(responseText)
    } catch {
      body = responseText.substring(0, 200)
    }

    return {
      name: func.name,
      status: response.status,
      statusText: response.statusText,
      success: response.ok || response.status === 202,
      response: body,
      desc: func.desc,
      args: func.args
    }
  } catch (error) {
    return {
      name: func.name,
      error: error.message,
      success: false,
      desc: func.desc,
      args: func.args
    }
  }
}

export async function GET(request) {
  const baseUrl = process.env.KALEIDO_REST_API
  const authHeader = process.env.KALEIDO_AUTH_HEADER
  const channel = process.env.HYPERLEDGER_CHANNEL_NAME
  const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME
  const signer = process.env.KALEIDO_SIGNER

  if (!baseUrl || !authHeader) {
    return NextResponse.json({
      error: 'Missing KALEIDO_REST_API or KALEIDO_AUTH_HEADER'
    }, { status: 400 })
  }

  console.log('🔎 Testing available chaincode functions...')

  // Test all functions in parallel for speed
  const results = await Promise.all(
    commonFunctions.map(func => 
      testFunction(baseUrl, authHeader, channel, chaincode, signer, func)
    )
  )

  const available = results.filter(r => r.success || (r.status >= 200 && r.status < 500))
  const working = results.filter(r => r.success)

  return NextResponse.json({
    tested: commonFunctions.length,
    available: available.length,
    working: working.length,
    results,
    config: {
      channel,
      chaincode,
      signer,
      baseUrl: baseUrl?.substring(0, 80) + '...'
    },
    nextSteps: working.length > 0 
      ? 'Found working functions: ' + working.map(r => r.name).join(', ')
      : 'No functions responding correctly. Check if chaincode is deployed.'
  })
}

export async function POST(request) {
  try {
    const { method = 'RegisterProduct' } = await request.json()

    const baseUrl = process.env.KALEIDO_REST_API
    const authHeader = process.env.KALEIDO_AUTH_HEADER
    const channel = process.env.HYPERLEDGER_CHANNEL_NAME
    const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME
    const signer = process.env.KALEIDO_SIGNER

    const func = commonFunctions.find(f => f.name === method) || { name: method, args: ['arg1', 'arg2'], desc: 'Custom function' }

    const result = await testFunction(baseUrl, authHeader, channel, chaincode, signer, func)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
