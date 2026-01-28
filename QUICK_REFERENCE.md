# Quick Reference - Blockchain Debugging

## The Problem (In One Sentence)
**Transactions submit successfully to Kaleido but don't appear in the explorer - we don't know why.**

## The Solution
**Use the new debugging endpoints to discover what chaincode functions actually exist, then update the code to use the correct function name and arguments.**

---

## Quick Start (Copy & Paste)

### 1. Deploy (copy this entire block)
```bash
cd g:\VSCODE\TraceRoot
git add .
git commit -m "Add blockchain debugging endpoints"
git push
# Wait for Vercel to deploy (2 minutes)
```

### 2. Test Discovery (paste URL in browser)
```
GET https://yourvercel.app/api/discover-chaincode
```
**Look for:** Any functions with `"success": true`

### 3. If Found
```
POST https://yourvercel.app/api/test-method
Body: {"method":"FoundFunctionName","args":["test","data"]}
```
**Check:** Transaction ID in response and in Kaleido Explorer

### 4. If Not Found
```
POST https://yourvercel.app/api/submit-payload
Body: See /api/submit-payload GET response for format
```
**Try:** Different function names and argument combinations

---

## The New Endpoints (What They Do)

| Endpoint | What It Does | Use When |
|----------|------------|----------|
| `GET /api/config-check` | Show configuration | First |
| `GET /api/discover-chaincode` | Find available functions | After deploying |
| `POST /api/test-method` | Test a specific function | After discovering |
| `POST /api/submit-payload` | Test custom payloads | If discovery fails |
| `GET /api/status` | Check system health | If confused |

---

## Expected Responses

### Good Response
```json
{
  "working": 3,
  "available": 4,
  "results": [
    {
      "name": "RegisterProduct",
      "status": 200,
      "success": true,
      "desc": "Register new product"
    }
  ]
}
```

### Bad Response
```json
{
  "working": 0,
  "available": 0,
  "results": [
    {
      "name": "RegisterProduct",
      "status": 404,
      "success": false,
      "desc": "Function not found"
    }
  ]
}
```

---

## What Each Status Code Means

- `200` = Function exists ✅ Use it
- `404` = Function doesn't exist ❌ Try another
- `400` = Wrong arguments ❌ Try different count
- `500` = Server error ❌ Check chaincode logic

---

## Most Likely Root Cause

**RegisterProduct function doesn't exist**

The code assumes it exists, but maybe it's called:
- `CreateProduct`
- `WriteProduct`
- `Invoke`
- Something else

**Solution:** Run `/api/discover-chaincode` to find the real name

---

## Files That Matter

1. **For Testing**
   - `discover-chaincode` endpoint (CRITICAL)
   - `test-method` endpoint
   - `submit-payload` endpoint

2. **For Understanding**
   - `BLOCKCHAIN_TEST_CHECKLIST.md` (step by step)
   - `BLOCKCHAIN_DEBUG_GUIDE.md` (detailed reference)

3. **For Fixing**
   - `lib/blockchain.js` (update function name here)

---

## One Minute Summary

1. Deploy new endpoints
2. Run `/api/discover-chaincode`
3. If function found → use it
4. If not found → try alternatives with `/api/test-method`
5. Once working → update `lib/blockchain.js`
6. Redeploy and verify

---

## Check These Things First

- [ ] Is `.env` updated with `HYPERLEDGER_ENDORSING_ORGS=`?
- [ ] Is Vercel deployment complete?
- [ ] Can you access `GET /api/config-check`?
- [ ] Does Kaleido dashboard show chaincode deployed?

---

## Emergency Checklist

If nothing works:
1. Check Kaleido dashboard → is chaincode deployed?
2. Check Kaleido dashboard → is peer online?
3. Check Kaleido dashboard → is channel created?
4. Run `/api/discover-chaincode` → share results
5. Check `/api/config-check` → verify config

---

## Success Indicators

You'll know it's fixed when:
- ✅ Discover endpoint shows working function
- ✅ Test endpoint returns 200/202
- ✅ Transaction appears in Kaleido Explorer
- ✅ Explorer shows product details

---

## The Command You Need Most

```
GET /api/discover-chaincode
```

This ONE endpoint will tell you what's wrong. Run it first.

---

## Contact Support With This

If you need help, provide:
1. Output from `/api/config-check`
2. Output from `/api/discover-chaincode`
3. Kaleido dashboard chaincode status screenshot

---

## Remember

- ✅ Network works (we're on Vercel)
- ✅ Transactions submit (no errors returned)
- ❌ Transactions don't appear (reason unknown)
- 🔍 We need to find the function name (run discover-chaincode)
- ✏️ Then update the code (fix lib/blockchain.js)
- ✅ Problem solved (redeploy)

---

## Version History

Created: January 2025
Purpose: Debug Kaleido Hyperledger integration
Status: Ready to test
Next: Deploy and run `/api/discover-chaincode`

---

**START HERE:** `GET /api/discover-chaincode`
