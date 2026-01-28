# TraceRoot Blockchain Testing Checklist

## Current Status
- ✅ Code deploys to Vercel successfully
- ✅ Kaleido endpoint is reachable (HTTP 204)
- ✅ MongoDB is connected and working
- ✅ Transactions generate and return IDs
- ❌ **ISSUE:** Transactions don't appear in Kaleido Explorer

## New Debugging Endpoints Created

These endpoints are now available to help diagnose the issue:

### 1. Configuration Check
**Endpoint:** `GET /api/config-check`
- Shows all environment variables (safely)
- Verifies Kaleido setup
- Confirms blockchain is enabled

**Action:** Test this first to ensure all configs are present

### 2. Status & Endpoint Discovery
**Endpoint:** `GET /api/status`
- Tests which Kaleido endpoints are reachable
- Shows available debugging endpoints
- Provides troubleshooting checklist

**Action:** Run this to see which endpoints respond

### 3. Discover Chaincode Functions (CRITICAL)
**Endpoint:** `GET /api/discover-chaincode`
- **Tests if RegisterProduct function exists**
- Tests all common chaincode function names
- Shows which functions are available
- **This is the most important endpoint to run**

**Important:** If this shows no working functions, the chaincode isn't deployed or the names are wrong

**Action:** Run this to find out what functions actually exist

### 4. Test Individual Methods
**Endpoint:** `POST /api/test-method`
- Test specific chaincode method names
- See the exact Kaleido response
- Get error messages if function fails

**Example Request:**
```json
{
  "method": "RegisterProduct",
  "args": ["id", "name", "origin", "category", "mfg", "date", "expiry", "details"]
}
```

**Action:** Use this if discover-chaincode finds a function name

### 5. Submit Custom Payload
**Endpoint:** `POST /api/submit-payload`
- Submit a custom payload directly to Kaleido
- See the full HTTP response
- Useful for testing different argument formats

**Example Request:**
```json
{
  "payload": {
    "headers": {
      "type": "SendTransaction",
      "channel": "default-channel",
      "chaincode": "traceroot",
      "signer": "e1ggy1f70s-admin",
      "useGateway": true,
      "endorsingOrgs": []
    },
    "func": "RegisterProduct",
    "args": ["id", "name", "origin", "category", "mfg", "date", "expiry", "details"]
  }
}
```

**Action:** Use this to test different payload formats

### 6. Test Transaction
**Endpoint:** `POST /api/test-transaction`
- Submits a test product registration
- Shows full Kaleido response
- Captures transaction ID

**Action:** Use this to test actual transaction submission

### 7. Query Blockchain
**Endpoint:** `GET /api/query-blockchain`
- Attempts to query the chaincode
- Tests if data is being stored
- Checks chaincode status

**Action:** Run this after submitting transactions to see if they're stored

### 8. Full System Diagnostics
**Endpoint:** `GET /api/diagnostics`
- Tests MongoDB connectivity
- Tests Kaleido connectivity
- Comprehensive status report

**Action:** Run this to get overall system health

## Recommended Testing Sequence

### Phase 1: Verify Configuration (5 minutes)
```bash
1. GET /api/config-check
   → Check that KALEIDO_REST_API starts with https://
   → Check that KALEIDO_AUTH_HEADER is > 50 chars
   → Check that HYPERLEDGER_CHAINCODE_NAME = "traceroot"
```

### Phase 2: Test Connectivity (5 minutes)
```bash
2. GET /api/status
   → Should show transactions endpoint available
   → Should list available debugging endpoints
```

### Phase 3: Discover Functions (10 minutes) ⭐ CRITICAL
```bash
3. GET /api/discover-chaincode
   → Look at results array
   → Find functions with status 200-299
   → Note the function names (e.g., RegisterProduct, CreateProduct, etc.)
   
   If no functions work:
   → Check if chaincode is deployed in Kaleido dashboard
   → Verify chaincode name is exactly "traceroot"
   → Verify channel name is exactly "default-channel"
   → Check if peer is online
```

### Phase 4: Test Working Function (5 minutes)
```bash
4. POST /api/test-method
   { "method": "RegisterProduct", "args": [...] }
   
   Or if different name found:
   { "method": "CreateProduct", "args": [...] }
   
   → Look at status code
   → If 200-299: Success! Note the transaction ID
   → If 400: Wrong arguments
   → If 404: Function doesn't exist
   → If 500: Chaincode error
```

### Phase 5: Verify in Explorer (10 minutes)
```bash
5. Open Kaleido Explorer
   URL: https://e1i8a4oupg-e1ggy1f70s-explorer.eu1-azure-ws.kaleido.io/
   
   → Look for recent transactions
   → Search for transaction ID returned from Phase 4
   → If visible: Issue is fixed! ✅
   → If not visible: Continue to Phase 6
```

### Phase 6: Debug Response (10 minutes)
```bash
6. POST /api/submit-payload with custom payload
   → Copy payload from /api/submit-payload GET
   → Modify arguments if needed
   → Look at kaleido.body in response
   → Check for error messages
   → Try different function names
   → Try with/without endorsingOrgs
```

### Phase 7: Update Code (5 minutes)
```bash
7. Once you find the correct:
   → Function name
   → Argument format
   → Endorsing orgs setting
   
   Update lib/blockchain.js with these values
   Redeploy to Vercel
   Test again
```

## What Each Response Code Means

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Check explorer for transaction |
| 202 | Accepted (pending) | Wait 30 sec, check explorer |
| 400 | Bad request | Check arguments format |
| 401 | Unauthorized | Check auth header |
| 403 | Forbidden | Check signer credentials |
| 404 | Not found | Check function/chaincode/channel name |
| 500 | Server error | Check chaincode logic, endorsement policy |
| 503 | Service unavailable | Kaleido may be down |

## Most Likely Issues

1. **RegisterProduct function doesn't exist** (30% probability)
   - Solution: Run `/api/discover-chaincode` to find real function names
   
2. **Wrong argument count or types** (25% probability)
   - Solution: Test with fewer args using `/api/test-method`
   
3. **Endorsement policy failing** (20% probability)
   - Solution: Verify `HYPERLEDGER_ENDORSING_ORGS` is empty
   
4. **Signer lacks permissions** (15% probability)
   - Solution: Verify signer in Kaleido dashboard
   
5. **Chaincode not deployed** (10% probability)
   - Solution: Check Kaleido dashboard for chaincode status

## Files Changed

### Configuration
- `.env` - Added `HYPERLEDGER_ENDORSING_ORGS` setting (leave empty)

### Code
- `lib/blockchain.js` - Made endorsingOrgs dynamic instead of hardcoded

### New Debugging Endpoints
- `app/api/config-check/route.js` - View configuration
- `app/api/status/route.js` - Test endpoint availability
- `app/api/discover-chaincode/route.js` - Find available functions
- `app/api/test-method/route.js` - Test individual methods
- `app/api/submit-payload/route.js` - Submit custom payloads
- `app/api/test-transaction/route.js` - Test transaction submission
- `app/api/query-blockchain/route.js` - Query blockchain
- `app/api/diagnostics/route.js` - Full system diagnostics

### Documentation
- `BLOCKCHAIN_DEBUG_GUIDE.md` - Comprehensive debugging guide
- `BLOCKCHAIN_TEST_CHECKLIST.md` - This file

## Next Immediate Actions

1. **Deploy to Vercel** (if not already deployed)
   ```bash
   git add .
   git commit -m "Add blockchain debugging endpoints"
   git push
   ```

2. **Run Phase 1-3 tests** to identify the problem
   - Start with `/api/config-check`
   - Then `/api/discover-chaincode`
   - This will tell us what's wrong

3. **Share results** - Once you get the discover-chaincode results, we can:
   - Identify actual chaincode function names
   - See specific error messages
   - Fix the integration properly

4. **Update code** - Based on what we find, update `lib/blockchain.js`

## Getting Full Debug Output

To see detailed logs on Vercel:
```bash
vercel logs
```

To see logs while testing locally:
```bash
npm run dev
# Then check the terminal for console.log output
```

## Testing Priority

### DO THIS FIRST (5 minutes)
- [ ] GET /api/config-check
- [ ] GET /api/discover-chaincode

### Then DO THIS (10 minutes)
- [ ] POST /api/test-method (with function from discover-chaincode)
- [ ] Check Kaleido Explorer for transaction

### Then IF STILL NOT WORKING (15 minutes)
- [ ] POST /api/submit-payload (test custom formats)
- [ ] Check error messages in responses
- [ ] Read BLOCKCHAIN_DEBUG_GUIDE.md for solutions

## Success Criteria

✅ You'll know it's fixed when:
1. `/api/discover-chaincode` shows at least one function with status 200-299
2. `/api/test-method` returns status 200 or 202
3. Transaction ID appears in Kaleido Explorer within 30 seconds
4. Product details are visible in Explorer transaction view

## Questions to Answer First

Before doing anything else:
1. Did you add these new endpoints to Vercel deployment?
2. Have you run `/api/discover-chaincode` to see what functions exist?
3. What error messages (if any) is Kaleido returning?
4. Can you see ANY transactions in the explorer (not just recent ones)?
5. Is the chaincode definitely deployed in Kaleido dashboard?

These answers will pinpoint exactly what's wrong!
