// Kaleido FireFly FabConnect REST client
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
  // FireFly FabConnect query format
  const url = `${baseUrl}/query`
  const payload = {
    headers: {
      type: 'Query',
      channel: channel,
      chaincode: chaincode
    },
    func: fn,
    args: args,
    strongread: false
  }
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
    throw new Error(`REST query failed ${res.status}: ${text}`)
  }
  return body
}

async function invoke(fn, args = [], transient = undefined) {
  ensureConfig()
  // FireFly FabConnect invoke format
  const url = `${baseUrl}/transactions`
  const payload = {
    headers: {
      type: 'SendTransaction',
      channel: channel,
      chaincode: chaincode
    },
    func: fn,
    args: args
  }
  if (transient) payload.transientMap = transient
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
    throw new Error(`REST invoke failed ${res.status}: ${text}`)
  }
  return body
}

module.exports = { query, invoke }
