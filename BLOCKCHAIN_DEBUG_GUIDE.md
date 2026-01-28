# TraceRoot Blockchain Debugging Guide

## Problem Statement
✅ Transactions submit successfully to Kaleido  
❌ Transactions don't appear in Kaleido Explorer  
🌐 Vercel deployment works (no firewall issues)  
🔧 Need to identify why Kaleido isn't recording transactions on blockchain

## Quick Debugging Steps

### Step 1: Verify Configuration
**Endpoint:** `GET /api/config-check`
- Shows all environment variables (safely)
- Verifies Kaleido endpoint format
- Checks if all required configs are present

### Step 2: Test Endpoint Availability
**Endpoint:** `GET /api/status`
- Tests which Kaleido endpoints are reachable
- Shows available debugging endpoints
- Provides troubleshooting checklist

### Step 3: Discover Available Chaincode Functions
**Endpoint:** `GET /api/discover-chaincode`
- Tests all common chaincode function names
- Shows which functions are available in your deployment
- Helps identify if `RegisterProduct` exists

**If no functions respond:**
- ❌ Chaincode is not deployed
- ❌ Chaincode name is wrong
- ❌ Channel name is wrong
- ❌ Signer credentials are invalid

### Step 4: Test Individual Chaincode Methods
**Endpoint:** `POST /api/test-method`
```json
{
  "method": "RegisterProduct",
  "args": [
    "TEST_PROD_001",
    "Test Product",
    "Test Origin",
    "Test Category",
    "Test Mfg",
    "2024-01-01T00:00:00Z",
    "2025-01-01T00:00:00Z",
    "Test details"
  ]
}
```
- Submit a test transaction
- See the full Kaleido response
- Check for specific error messages

### Step 5: Detailed Transaction Debug
**Endpoint:** `POST /api/test-transaction`
- Submits a minimal test transaction
- Captures the full HTTP response from Kaleido
- Shows transaction ID and status
- Logs everything to console

### Step 6: Check Full System Status
**Endpoint:** `GET /api/diagnostics`
- Tests MongoDB connectivity
- Tests Kaleido endpoint reachability
- Shows system-wide configuration

## Possible Issues & Solutions

### Issue 1: RegisterProduct Function Not Found (404)
**Symptoms:**
- GET /api/discover-chaincode returns 404 for RegisterProduct
- POST /api/test-method returns 404

**Solutions:**
1. Check Kaleido dashboard - is chaincode deployed?
2. Verify chaincode name: `echo $HYPERLEDGER_CHAINCODE_NAME` should be `traceroot`
3. Check if function name is different (e.g., `CreateProduct`, `WriteProduct`)
4. Run GET /api/discover-chaincode to find actual function names

### Issue 2: Transaction Rejected (400)
**Symptoms:**
- POST /api/test-transaction returns 400
- Response shows "Invalid arguments" or similar

**Solutions:**
1. Check argument count - does your chaincode expect 8 arguments?
2. Check argument types - should all be strings
3. Try different functions with different argument counts
4. Use POST /api/test-method with fewer arguments

### Issue 3: Endorsement Policy Failure (500)
**Symptoms:**
- Transaction returns 500 error
- Response mentions "endorsement" or "peer"

**Solutions:**
1. Check endorsingOrgs setting (should be empty array [] for Kaleido managed service)
2. Set `HYPERLEDGER_ENDORSING_ORGS` to empty string in .env
3. Verify MSP ID is correct in Kaleido dashboard
4. Check if peer is online in Kaleido network

### Issue 4: Signer Invalid (403/401)
**Symptoms:**
- Transactions return 403 Forbidden
- Response mentions "signer" or "authentication"

**Solutions:**
1. Verify KALEIDO_SIGNER is correct: `echo $KALEIDO_SIGNER`
2. Check KALEIDO_AUTH_HEADER is valid
3. Verify signer exists in Kaleido dashboard
4. Check if credentials are still active

### Issue 5: Wrong Channel (404)
**Symptoms:**
- GET /api/discover-chaincode returns 404 for all functions
- Response mentions "channel not found"

**Solutions:**
1. Verify HYPERLEDGER_CHANNEL_NAME: `echo $HYPERLEDGER_CHANNEL_NAME`
2. Check Kaleido dashboard for actual channel name
3. Make sure channel is created and peer joined
4. Check channel spelling (case-sensitive)

### Issue 6: Transaction Accepted but Not Recorded
**Symptoms:**
- POST /api/test-transaction returns 200/202 with transaction ID
- No transaction appears in explorer after 30 seconds
- Running /api/discover-chaincode works fine

**Solutions:**
1. **Check function logic** - is RegisterProduct correctly storing data?
2. **Check for errors in chaincode** - function might be throwing error silently
3. **Query the data back** - try POST /api/test-method with QueryProduct
4. **Check explorer filters** - transactions might be there but filtered out
5. **Verify ledger state** - transaction might be failed, not committed

## Environment Variables to Check

```bash
# Required variables
KALEIDO_REST_API=https://...
KALEIDO_AUTH_HEADER=Basic ...
HYPERLEDGER_CHANNEL_NAME=default-channel
HYPERLEDGER_CHAINCODE_NAME=traceroot
KALEIDO_SIGNER=...
USE_REAL_BLOCKCHAIN=true

# Optional variables
HYPERLEDGER_ENDORSING_ORGS=  # Leave empty for Kaleido
KALEIDO_EXPLORER=https://...
NODE_ENV=production  # Should be set on Vercel
```

## Testing Checklist

```
[ ] 1. GET /api/config-check - All variables present?
[ ] 2. GET /api/status - Endpoints responding?
[ ] 3. GET /api/diagnostics - MongoDB + Kaleido ok?
[ ] 4. GET /api/discover-chaincode - Any functions working?
[ ] 5. POST /api/test-method - Can call specific function?
[ ] 6. POST /api/test-transaction - Gets valid TX ID?
[ ] 7. Check explorer - TX ID visible in Kaleido Explorer?
[ ] 8. Query function - Can you query the data back?
```

## Common Response Codes

- **200/202** - Transaction accepted, likely submitted
- **400** - Bad request, likely wrong arguments or format
- **401/403** - Authentication failed, check signer/auth header
- **404** - Function/channel/chaincode not found
- **500** - Server error, likely endorsement or chaincode logic error
- **503** - Service unavailable, Kaleido may be down

## Kaleido Explorer Links

- **Dashboard:** https://e1i8a4oupg.eu1-azure-ws.kaleido.io/
- **Explorer:** https://e1i8a4oupg-e1ggy1f70s-explorer.eu1-azure-ws.kaleido.io/
- **Transaction:** Add `/tx/{transactionId}` to explorer URL

## Debug Workflow

1. **Start with /api/status** - See available endpoints
2. **Run /api/discover-chaincode** - Find working functions
3. **Use /api/test-method** - Test specific functions
4. **Check /api/config-check** - Verify configuration
5. **Test with /api/test-transaction** - Full debug output
6. **Check Kaleido Explorer** - See if transaction appears
7. **Review console logs** - Look for detailed error messages

## Getting Help

If you need support:
1. Run GET /api/status and capture the response
2. Run GET /api/discover-chaincode and capture the response
3. Run POST /api/test-transaction and capture the response
4. Check Vercel logs: `vercel logs`
5. Check Kaleido dashboard for peer/channel status
6. Share these outputs with Kaleido support team

## Next Steps

After identifying the issue:
1. If function doesn't exist → Contact Kaleido or check chaincode code
2. If function errors → Debug chaincode logic
3. If chain is wrong → Update environment variable
4. If signer is wrong → Verify Kaleido credentials
5. If endorsement fails → Check MSP/endorsing org settings
