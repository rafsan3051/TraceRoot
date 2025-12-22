#!/usr/bin/env node
/* Simple smoke test runner for TraceRoot APIs and pages */

const candidates = [
  process.env.NEXT_PUBLIC_APP_URL?.trim(),
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3001'
].filter(Boolean)
let BASE = candidates[0]

function log(step, ok, extra = '') {
  const status = ok ? 'PASS' : 'FAIL'
  console.log(`[${status}] ${step}${extra ? ' - ' + extra : ''}`)
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

async function checkReachable(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    return res.ok
  } catch { return false }
}

async function waitForServer(url = BASE, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const ok = await checkReachable(url)
    if (ok) return true
    await wait(1000)
  }
  return false
}

function buildHeaders(cookieJar, extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra }
  if (cookieJar.authToken) headers['Cookie'] = `auth-token=${cookieJar.authToken}`
  return headers
}

async function jsonReq(method, path, body, cookieJar, extraHeaders = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(cookieJar, extraHeaders),
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual'
  })
  let json
  try { json = await res.json() } catch { json = null }
  return { res, json }
}

async function textReq(method, path, cookieJar, extraHeaders = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(cookieJar, extraHeaders),
  })
  const text = await res.text()
  return { res, text }
}

function captureAuthCookie(res, jar) {
  const setCookie = res.headers.get('set-cookie') || ''
  const m = setCookie.match(/auth-token=([^;]+)/)
  if (m) jar.authToken = m[1]
}

async function run() {
  const cookieJar = {}

  // 1) Wait for server
  // Try multiple candidates
  let up = false
  for (const c of candidates) {
    BASE = c
    up = await waitForServer(BASE, 10000)
    if (up) break
  }
  log('Server reachable', up, BASE)
  // Don't hard-fail here; continue and let endpoint calls decide

  // 2) Register user (farmer)
  const email = `smoke_${Date.now()}@example.com`
  const password = 'smokePass123!'
  const registerBody = { name: 'Smoke Tester', email, password, role: 'FARMER' }
  let { res: regRes, json: regJson } = await jsonReq('POST', '/api/auth/register', registerBody, cookieJar)
  if (!regRes.ok) {
    // retry a couple of times in case server isn't fully ready yet
    for (let i=0; i<3 && !regRes.ok; i++) {
      await wait(2000)
      ({ res: regRes, json: regJson } = await jsonReq('POST', '/api/auth/register', registerBody, cookieJar))
    }
  }
  log('Register', regRes.ok, regRes.status)
  if (!regRes.ok) return process.exit(2)

  // 3) Login
  const { res: loginRes, json: loginJson } = await jsonReq('POST', '/api/auth/login', { email, password }, cookieJar)
  captureAuthCookie(loginRes, cookieJar)
  log('Login', loginRes.ok && !!cookieJar.authToken, loginRes.status)
  if (!cookieJar.authToken) return process.exit(3)

  // 4) Create product
  const prodBody = {
    name: `Test Product ${Date.now()}`,
    origin: 'Test Farm',
    manufactureDate: new Date().toISOString().slice(0,10),
    price: 12.5,
    category: 'Test',
    description: 'Smoke test product',
    latitude: 23.7808875,
    longitude: 90.2792371,
    locationAccuracy: 5
  }
  const { res: createRes, json: createJson } = await jsonReq('POST', '/api/product', prodBody, cookieJar)
  const productId = createJson?.product?.id
  log('Create Product', createRes.ok && !!productId, productId || createRes.status)
  if (!productId) return process.exit(4)

  // 5) Product page (SSR)
  const { res: pageRes } = await textReq('GET', `/product/${productId}`, cookieJar)
  log('Product Page', pageRes.ok, pageRes.status)
  if (!pageRes.ok) return process.exit(5)

  // 6) Verify API
  const { res: verifyRes, json: verifyJson } = await jsonReq('GET', `/api/verify/${productId}`, null, cookieJar)
  log('Verify API', verifyRes.ok && verifyJson?.success, verifyRes.status)
  if (!verifyRes.ok) return process.exit(6)

  // 7) Create supply chain event
  const eventBody = { productId, eventType: 'PACKAGED', location: 'Warehouse A', latitude: 23.78, longitude: 90.27, locationAccuracy: 10 }
  const { res: eventRes, json: eventJson } = await jsonReq('POST', '/api/update', eventBody, cookieJar)
  log('Create Event', eventRes.ok && !!eventJson?.id, eventRes.status)

  // 8) Watchlist add/get/delete
  const { res: watchAddRes } = await jsonReq('POST', '/api/watchlist', { productId, notifyEmail: true }, cookieJar)
  log('Watchlist Add', watchAddRes.ok, watchAddRes.status)

  const { res: watchGetRes } = await jsonReq('GET', '/api/watchlist', null, cookieJar)
  log('Watchlist Get', watchGetRes.ok, watchGetRes.status)

  const { res: watchDelRes } = await jsonReq('DELETE', `/api/watchlist?productId=${productId}`, null, cookieJar)
  log('Watchlist Delete', watchDelRes.ok, watchDelRes.status)

  // 9) Hide product
  const { res: hideRes } = await jsonReq('POST', `/api/product/${productId}/delete`, null, cookieJar)
  log('Hide Product', hideRes.ok, hideRes.status)

  // Done
  console.log('Smoke test complete.')
  return process.exit(0)
}

run().catch(err => { console.error(err); process.exit(99) })
