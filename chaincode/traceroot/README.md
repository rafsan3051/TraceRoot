# TraceRoot Chaincode

Fixed Node.js chaincode for Hyperledger Fabric (Kaleido).

## What Was Fixed

**Problem:** Argument count mismatch
- Old: `RegisterProduct(ctx, productId, name, origin, category, dataJson)` - 5 args
- New: `RegisterProduct(ctx, productId, name, origin, category, manufacturer, mfgDate, expiryDate, dataJson)` - 8 args

**Now matches your application's payload:**
```javascript
args: [
  productId,        // arg 0
  name,             // arg 1
  origin,           // arg 2
  category,         // arg 3
  manufacturer,     // arg 4
  mfgDate,          // arg 5
  expiryDate,       // arg 6
  JSON.stringify({...}) // arg 7
]
```

## Files in This Package

- `index.js` - Entry point
- `lib/traceroot-contract.js` - Main contract (FIXED)
- `package.json` - Dependencies
- `package-lock.json` - Dependency lock file
- `.chaincodeignore` - Files to exclude from package

## How to Deploy to Kaleido

### Step 1: Create ZIP
```bash
cd chaincode/traceroot
zip -r traceroot-chaincode.zip . -x "node_modules/*" "*.git*"
```

Or on Windows:
- Right-click the `traceroot` folder
- Select "Send to" → "Compressed (zipped) folder"
- Rename to `traceroot-chaincode.zip`

### Step 2: Upload to Kaleido
1. Go to Kaleido Dashboard
2. Navigate to **Chaincodes** section
3. Click **Upload Chaincode** or **Update Chaincode**
4. Select `traceroot-chaincode.zip`
5. Set version (e.g., `1.0.1` or higher than current)
6. Click **Deploy**

### Step 3: Approve & Commit
1. Wait for chaincode to install
2. **Approve** the chaincode for your org
3. **Commit** the chaincode to the channel
4. Wait for container to start (may take 1-2 minutes)

### Step 4: Test
```bash
# Test locally first
curl http://localhost:3000/api/discover-chaincode

# Or test on Vercel
curl https://traceroot.vercel.app/api/discover-chaincode
```

Should now show:
```json
{
  "working": 1,
  "results": [
    {
      "name": "RegisterProduct",
      "status": 200,
      "success": true
    }
  ]
}
```

## Available Functions

- `RegisterProduct(productId, name, origin, category, manufacturer, mfgDate, expiryDate, dataJson)`
- `RecordEvent(productId, eventType, location, dataJson)`
- `GetProduct(productId)`
- `GetProductHistory(productId)`
- `TransferOwnership(productId, newOwner)`

## Node.js Version

Requires Node.js 18.12+ or 20.9+

## Dependencies

- `fabric-contract-api` ^2.5.0

All dependencies will be installed automatically by Kaleido during deployment.
