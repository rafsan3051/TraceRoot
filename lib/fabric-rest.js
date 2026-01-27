// Kaleido Standard Network REST client
// Direct REST calls to Hyperledger Fabric via Kaleido REST Gateway

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
  // Standard Network query format
  const url = `${baseUrl}/channels/${channel}/chaincodes/${chaincode}?fcn=${fn}`
  console.log('📤 Query:', { fn, args })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
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
  // Standard Network invoke format
  const url = `${baseUrl}/channels/${channel}/chaincodes/${chaincode}`
  const payload = {
    fcn: fn,
    args: args
  }
  if (transient) payload.transientMap = transient
  console.log('📤 Invoke:', { function: fn, argCount: args.length })
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
