// Kaleido FabConnect REST client (Standard Network gateway)
// Uses Basic Auth with App Credentials to query/invoke chaincode

const baseUrl = process.env.KALEIDO_REST_API?.replace(/\/$/, '')
const channel = process.env.HYPERLEDGER_CHANNEL_NAME
const chaincode = process.env.HYPERLEDGER_CHAINCODE_NAME
const authHeader = process.env.KALEIDO_AUTH_HEADER

function ensureConfig() {
  if (!baseUrl) throw new Error('KALEIDO_REST_API not set')
  if (!channel) throw new Error('HYPERLEDGER_CHANNEL_NAME not set')
  if (!chaincode) throw new Error('HYPERLEDGER_CHAINCODE_NAME not set')
  if (!authHeader) throw new Error('KALEIDO_AUTH_HEADER not set')
}

async function query(fn, args = []) {
  ensureConfig()
  // FabConnect query format
  const url = `${baseUrl}/query`
  const extraHeaders = {}
  if (typeof process.env.FABCONNECT_USE_GATEWAY === 'string') {
    extraHeaders.useGateway = process.env.FABCONNECT_USE_GATEWAY === 'true'
  }
  if (process.env.FABCONNECT_ENDORSING_ORGS) {
    extraHeaders.endorsingOrgs = process.env.FABCONNECT_ENDORSING_ORGS.split(',').map(s => s.trim()).filter(Boolean)
  }

  const payload = {
    headers: {
      type: 'Query',
      channel: channel,
      chaincode: chaincode,
      ...extraHeaders
    },
    func: fn,
    args: args,
    strongread: false
  }
  console.log('📤 Query:', { url, fn, args })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  const body = (() => { try { return JSON.parse(text) } catch { return { raw: text } } })()
  if (!res.ok) {
    console.error('❌ Query failed:', res.status, text)
    throw new Error(`Query failed ${res.status}: ${text}`)
  }
  console.log('✅ Query response:', body)
  return body
}

async function invoke(fn, args = [], transient = undefined) {
  ensureConfig()
  // FabConnect invoke format
  const url = `${baseUrl}/transactions`
  const signer = process.env.KALEIDO_SIGNER
  const extraHeaders = {}
  if (typeof process.env.FABCONNECT_USE_GATEWAY === 'string') {
    extraHeaders.useGateway = process.env.FABCONNECT_USE_GATEWAY === 'true'
  }
  if (process.env.FABCONNECT_ENDORSING_ORGS) {
    extraHeaders.endorsingOrgs = process.env.FABCONNECT_ENDORSING_ORGS.split(',').map(s => s.trim()).filter(Boolean)
  }

  const headers = {
      type: 'SendTransaction',
      channel: channel,
      chaincode: chaincode,
      ...extraHeaders
    }
  if (signer) headers.signer = signer
  const payload = {
    headers,
    func: fn,
    args: args
  }
  if (transient) payload.transientMap = transient
  console.log('📤 Invoke:', { function: fn, argCount: args.length, signer: signer || '(from auth)', args })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  const body = (() => { try { return JSON.parse(text) } catch { return { raw: text } } })()
  if (!res.ok) {
    console.error('❌ Invoke failed:', res.status, text)
    throw new Error(`Invoke failed ${res.status}: ${text}`)
  }
  return body
}

export { query, invoke }
