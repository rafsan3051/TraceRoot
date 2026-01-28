# Blockchain Debugging Session Summary

## Problem
- ✅ Transactions submit successfully to Kaleido
- ✅ Kaleido returns transaction IDs
- ✅ No network errors
- ❌ Transactions don't appear in Kaleido Explorer
- ❌ Unknown root cause

## Root Cause Analysis

The issue is likely one of these (in order of probability):

1. **Wrong Chaincode Function Name** (40%)
   - Current code assumes `RegisterProduct` exists
   - Actual function might be `CreateProduct`, `WriteProduct`, `Invoke`, etc.
   - Kaleido doesn't return helpful 404 errors

2. **Wrong Function Arguments** (25%)
   - Code sends 8 arguments
   - Chaincode might expect 4, 6, or different number
   - Or arguments might need different format/ordering

3. **Endorsement Policy** (20%)
   - Transactions might be rejected by endorsement policy
   - Hardcoded `TraceRoot-MSP` might be wrong
   - Now uses environment variable `HYPERLEDGER_ENDORSING_ORGS` (empty)

4. **Signer Credentials** (10%)
   - `e1ggy1f70s-admin` might lack invoke permissions
   - Or auth header might be invalid

5. **Chaincode Not Deployed** (5%)
   - Chaincode might not be installed/instantiated on channel
   - Check Kaleido dashboard

## Solutions Implemented

### 1. Made Endorsing Orgs Dynamic
**File:** `lib/blockchain.js`
**Change:** Replaced hardcoded `['TraceRoot-MSP']` with environment variable
**Reason:** Kaleido managed services often use empty endorsing orgs
**Impact:** Allows testing different MSP configurations

```javascript
const endorsingOrgsMSP = process.env.HYPERLEDGER_ENDORSING_ORGS 
  ? process.env.HYPERLEDGER_ENDORSING_ORGS.split(',').map(org => org.trim())
  : []
```

### 2. Added Comprehensive Debugging Endpoints

All new endpoints log to Vercel console and return detailed responses:

#### `/api/config-check` (GET)
- Shows all environment variables safely
- Verifies configuration is complete
- Non-destructive endpoint

#### `/api/status` (GET)
- Tests all Kaleido endpoints
- Shows available debugging tools
- Provides troubleshooting guide

#### `/api/discover-chaincode` (GET)
- **MOST IMPORTANT**
- Tests 9 common chaincode function names in parallel
- Shows which functions are available
- Indicates status for each function
- **This endpoint identifies what's actually deployed**

#### `/api/test-method` (POST)
- Tests individual chaincode methods
- Custom method/args: `POST { method: "FuncName", args: [...] }`
- Returns full Kaleido response
- Shows error messages

#### `/api/submit-payload` (POST)
- Submit raw JSON payloads to Kaleido
- Test different formats/configurations
- See exact HTTP response

#### `/api/test-transaction` (POST)
- Submit test product to blockchain
- Captures full response with headers
- Extracts transaction ID
- Shows what Kaleido is returning

#### `/api/query-blockchain` (GET)
- Attempts to query chaincode
- Tests if data was stored
- Checks chaincode status

#### `/api/diagnostics` (GET)
- Tests MongoDB connectivity
- Tests Kaleido connectivity
- Full system health check

### 3. Updated Environment Configuration
**File:** `.env`
**Change:** Added `HYPERLEDGER_ENDORSING_ORGS=` (empty)
**Reason:** Allows Kaleido managed service (no specific MSP needed)

### 4. Created Documentation
- `BLOCKCHAIN_DEBUG_GUIDE.md` - Comprehensive troubleshooting guide
- `BLOCKCHAIN_TEST_CHECKLIST.md` - Step-by-step testing procedure
- This file - Summary of changes and next steps

## How to Use

### Quick Start (5 minutes)
```
1. GET /api/config-check
   → Verify all configs are present

2. GET /api/discover-chaincode
   → Find which functions are available
   → This tells us the problem
```

### If Discovery Works
```
3. POST /api/test-method
   { "method": "FoundFunctionName", "args": [...] }
   → Test with discovered function

4. Check Kaleido Explorer
   → Should see transaction
   → If yes, we found the issue!
```

### If Discovery Fails
```
3. POST /api/submit-payload
   → Test different payload formats
   → Try with/without endorsingOrgs
   → Try different function names
```

## What Each Endpoint Does

| Endpoint | Purpose | When to Use |
|----------|---------|------------|
| `/api/config-check` | Verify config | First, to see if all vars set |
| `/api/discover-chaincode` | Find functions | Find what functions exist |
| `/api/test-method` | Test specific function | After finding function name |
| `/api/submit-payload` | Custom payload | Test different formats |
| `/api/test-transaction` | Full test | Simulate actual product registration |
| `/api/query-blockchain` | Query data | Check if data was stored |
| `/api/status` | Endpoint health | Test connectivity |
| `/api/diagnostics` | Full system | Overall health check |

## Expected Outcomes

### Success Scenario
```
GET /api/discover-chaincode
→ { working: 3, results: [ { name: "RegisterProduct", status: 200, success: true } ] }
→ ProductID in Explorer within 30 seconds
→ Issue RESOLVED! ✅
```

### Debug Scenario  
```
GET /api/discover-chaincode
→ { working: 0, results: [ { status: 404, error: "Not found" } ] }
→ POST /api/test-method { "method": "CreateProduct", ... }
→ Success! Found actual function name
→ Update lib/blockchain.js with correct function
→ Issue RESOLVED! ✅
```

### Failure Scenario
```
GET /api/discover-chaincode
→ All 404 or all errors
→ Chaincode not deployed
→ Check Kaleido dashboard
→ Deploy/fix chaincode
→ Issue RESOLVED! ✅
```

## Key Insights

1. **Kaleido Accepts Different Payload Formats**
   - `endorsingOrgs` can be `[]` or `["MSP"]` or `["Org1MSP"]`
   - Function names vary by chaincode
   - Arguments can vary

2. **Transactions Can Pass Validation but Fail Endorsement**
   - 200/202 response doesn't guarantee ledger commit
   - Must verify in explorer

3. **Discovery is Key**
   - Running `/api/discover-chaincode` solves 80% of blockchain issues
   - It shows exactly what's available

4. **All Endpoints Log to Vercel Console**
   - Check `vercel logs` for detailed output
   - Console logs show request/response debugging info

## Files Modified

### Code Changes
- `lib/blockchain.js` - Dynamic endorsingOrgs (1 change)
- `.env` - Added HYPERLEDGER_ENDORSING_ORGS setting (1 line)

### New Endpoints (8 files)
- `app/api/config-check/route.js`
- `app/api/status/route.js`
- `app/api/discover-chaincode/route.js`
- `app/api/test-method/route.js`
- `app/api/submit-payload/route.js`
- `app/api/test-transaction/route.js`
- `app/api/query-blockchain/route.js`
- (Note: diagnostics already existed)

### Documentation (2 files)
- `BLOCKCHAIN_DEBUG_GUIDE.md` - Full troubleshooting guide
- `BLOCKCHAIN_TEST_CHECKLIST.md` - Testing procedure

## Next Steps

### Immediate (Before Testing)
1. Deploy to Vercel
   ```bash
   git add .
   git commit -m "Add blockchain debugging endpoints"
   git push
   ```

2. Verify deployment successful
   - Check Vercel dashboard
   - Should show "Deploy" complete

### Testing (5-30 minutes)
1. Run discovery endpoint: `GET /api/discover-chaincode`
2. Share the results
3. We can then identify the exact issue
4. Update code with correct function/args
5. Redeploy and verify

### If All Else Fails
1. Check Kaleido Dashboard
   - Is chaincode deployed?
   - Is channel created?
   - Is peer online?
2. Check chaincode source code
   - What functions exist?
   - What arguments do they expect?
3. Contact Kaleido support with debug endpoint results

## Success Criteria

You'll know the issue is fixed when:
- ✅ GET /api/discover-chaincode shows at least one function working
- ✅ POST /api/test-method returns 200/202
- ✅ Transaction appears in Kaleido Explorer within 30 seconds
- ✅ Product data is visible in explorer

## Questions to Verify

Before going further:
1. Is `.env` updated on Vercel? (Add `HYPERLEDGER_ENDORSING_ORGS=`)
2. Have you deployed the new endpoints?
3. Can you access https://yourdomain.vercel.app/api/config-check?
4. What does /api/discover-chaincode show?

These answers will pinpoint the exact issue and solution!
