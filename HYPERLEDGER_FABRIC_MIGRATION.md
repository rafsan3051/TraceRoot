# Hyperledger Fabric Migration Guide

## Overview

TraceRoot is being migrated from Ethereum blockchain to Hyperledger Fabric for enterprise-grade supply chain tracking. This document outlines the migration process and current status.

## Why Hyperledger Fabric?

- **Enterprise-focused**: Designed for private, permission networks
- **Better performance**: Higher transaction throughput than public blockchains
- **Privacy**: Supports private data collections and confidential transactions
- **Lower costs**: No gas fees required
- **Pluggable architecture**: Can customize consensus, membership services, etc.

## Migration Status

### ✅ Completed

1. **Dependencies Added** (package.json)
   - `fabric-network@^2.5.0` - Main Fabric SDK
   - `fabric-ca-client@^2.5.0` - Certificate Authority client
   
2. **Environment Variables Configured** (.env.example)
   ```
   BLOCKCHAIN_NETWORK="hyperledger"
   HYPERLEDGER_CONNECTION_PROFILE="./fabric-network/connection-profile.json"
   HYPERLEDGER_WALLET_PATH="./wallet"
   HYPERLEDGER_USER_ID="appUser"
   HYPERLEDGER_CHANNEL_NAME="tracerootchannel"
   HYPERLEDGER_CHAINCODE_NAME="traceroot"
   HYPERLEDGER_MSP_ID="Org1MSP"
   HYPERLEDGER_PEER_ENDPOINT="localhost:7051"
   HYPERLEDGER_CA_ENDPOINT="localhost:7054"
   ```

3. **NPM Scripts Created** (package.json)
   - `fabric:network:start` - Start local Fabric network
   - `fabric:network:down` - Stop local Fabric network
   - `fabric:chaincode:deploy` - Deploy chaincode to network
   - `fabric:test` - Test Fabric connectivity

4. **Backup Created**
   - Original Ethereum implementation saved to `lib/blockchain-ethereum-backup.js`
   - Alternative Fabric implementation available in `lib/blockchain-fabric.js`

### 🔨 In Progress

1. **Blockchain Integration Layer** (lib/blockchain.js)
   - Current: Uses ethers.js for Ethereum
   - Target: Use fabric-network SDK
   - Status: Ethereum version still active (lib/blockchain.js)
   - New version ready: lib/blockchain-fabric.js

### ⏳ Pending

1. **Chaincode Development**
   - Create chaincode directory structure
   - Implement smart contract logic in JavaScript/TypeScript
   - Functions needed:
     - RegisterProduct
     - RecordEvent
     - GetProduct
     - GetProductHistory
     - TransferOwnership

2. **Fabric Network Setup**
   - Docker Compose configuration
   - Network startup scripts
   - Connection profiles
   - Certificate generation

3. **Deployment Scripts**
   - Chaincode packaging
   - Chaincode installation
   - Chaincode deployment
   - Testing scripts

4. **Documentation**
   - Update BLOCKCHAIN_SETUP.md with Fabric instructions
   - Network setup guide
   - Chaincode deployment guide
   - Troubleshooting guide

## Current File Structure

```
trace-root/
├── lib/
│   ├── blockchain.js                    # ⚠️ Still using Ethereum (needs replacement)
│   ├── blockchain-ethereum-backup.js    # ✅ Ethereum backup
│   └── blockchain-fabric.js             # ✅ New Fabric implementation (ready)
├── chaincode/                           # ❌ Not created yet
│   └── traceroot/
│       ├── index.js
│       ├── package.json
│       └── lib/
│           └── traceroot-contract.js
├── fabric-network/                      # ❌ Not created yet
│   ├── docker-compose.yaml
│   ├── network.sh
│   ├── connection-profile.json
│   └── crypto-config/
└── wallet/                              # ❌ Empty (created when users enroll)
```

## API Routes for Fabric

### Enroll Admin & User (Development Only)
**POST** `/api/fabric/enroll`

Enrolls CA admin and application user into the wallet. Disabled in production.

**Headers:**
- `x-enroll-key`: Optional shared secret (set `FABRIC_ENROLL_KEY` in `.env`)

**Response:**
```json
{ "ok": true, "admin": true, "user": true }
```

### Register Product on Blockchain
**POST** `/api/fabric/register`

Records a product to the Fabric blockchain using `recordToBlockchain()`.

**Body:**
```json
{
  "id": "prod-123",
  "name": "Organic Tomatoes",
  "origin": "California",
  "category": "Vegetables"
}
```

**Response:**
```json
{ "txId": "fabric_tx_1234567890_abc123" }
```

---

## Next Steps

### Step 1: Install Fabric Packages

```powershell
cd h:\VSCODE\trace-root
npm install
```

This will install:
- fabric-network (Fabric SDK)
- fabric-ca-client (Certificate Authority client)

### Step 2: Replace Blockchain Implementation

Replace `lib/blockchain.js` with the Fabric version:

```powershell
Copy-Item lib\blockchain-fabric.js lib\blockchain.js -Force
```

**Key Changes in blockchain.js:**

**OLD (Ethereum):**
```javascript
// Uses ethers.js
import { ethers } from 'ethers'
const provider = new ethers.JsonRpcProvider(...)
const contract = new ethers.Contract(...)
await contract.registerProduct(...)
```

**NEW (Fabric):**
```javascript
// Uses fabric-network
import { Gateway, Wallets } from 'fabric-network'
const gateway = new Gateway()
const network = await gateway.getNetwork(CHANNEL_NAME)
const contract = network.getContract(CHAINCODE_NAME)
await contract.submitTransaction('RegisterProduct', ...)
```

### Step 3: Create Chaincode

Create the smart contract logic for Fabric:

**Directory:** `chaincode/traceroot/`

**Files needed:**
1. `index.js` - Entry point
2. `package.json` - Chaincode dependencies
3. `lib/traceroot-contract.js` - Main contract logic

**Contract Functions:**
- `RegisterProduct(productId, name, origin, category, data)`
- `RecordEvent(productId, eventType, location, data)`
- `GetProduct(productId)`
- `GetProductHistory(productId)`
- `TransferOwnership(productId, newOwner)`

### Step 4: Set Up Fabric Network

Create local development network using Docker:

**Directory:** `fabric-network/`

**Files needed:**
1. `docker-compose.yaml` - Network containers (peers, orderers, CA)
2. `network.sh` - Network management script
3. `connection-profile.json` - Network connection details
4. `crypto-config/` - Certificates and keys

**Components:**
- Orderer: Manages transaction ordering
- Peer: Maintains ledger copy
- CA (Certificate Authority): Issues certificates
- CouchDB: State database

### Step 5: Deploy and Test

```powershell
# Start Fabric network
npm run fabric:network:start

# Deploy chaincode
npm run fabric:chaincode:deploy

# Test connectivity
npm run fabric:test
```

### Step 6: Update Application Code

Update `.env` with actual values:
```
USE_REAL_BLOCKCHAIN=true
BLOCKCHAIN_NETWORK="hyperledger"
HYPERLEDGER_CHANNEL_NAME="tracerootchannel"
HYPERLEDGER_CHAINCODE_NAME="traceroot"
...
```

## API Compatibility

The new Fabric implementation maintains the same API as Ethereum:

### recordToBlockchain(data)
- **Before:** Calls Ethereum smart contract
- **After:** Submits transaction to Fabric chaincode
- **Interface:** No change

### verifyBlockchainData(txId)
- **Before:** Queries Ethereum transaction receipt
- **After:** Returns Fabric transaction metadata
- **Interface:** No change

### getBlockchainHistory(productId)
- **Before:** Queries Ethereum events
- **After:** Calls GetProductHistory chaincode function
- **Interface:** No change

## Testing

### Mock Mode (Current Default)
```
USE_REAL_BLOCKCHAIN=false
```
- No actual blockchain required
- Returns mock transaction IDs
- Good for development/testing

### Real Fabric Mode
```
USE_REAL_BLOCKCHAIN=true
```
- Requires Fabric network running
- Requires chaincode deployed
- Requires user enrolled in wallet

## Troubleshooting

### Issue: "User not found in wallet"
**Solution:** Run enrollment script to create user identity

### Issue: "Connection profile not found"
**Solution:** Create `fabric-network/connection-profile.json`

### Issue: "Chaincode not found"
**Solution:** Deploy chaincode using `npm run fabric:chaincode:deploy`

### Issue: "Cannot connect to peer"
**Solution:** Ensure Fabric network is running (`npm run fabric:network:start`)

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric SDK for Node.js](https://hyperledger.github.io/fabric-sdk-node/)
- [Fabric Samples](https://github.com/hyperledger/fabric-samples)

## Migration Checklist

- [x] Add Fabric dependencies to package.json
- [x] Create Fabric configuration in .env.example
- [x] Add Fabric npm scripts
- [x] Backup Ethereum implementation
- [x] Create new Fabric blockchain.js
- [ ] Install npm packages
- [ ] Replace blockchain.js with Fabric version
- [ ] Create chaincode directory
- [ ] Implement chaincode logic
- [ ] Create Fabric network setup
- [ ] Test network deployment
- [ ] Test chaincode deployment
- [ ] Update documentation
- [ ] Test end-to-end product tracking

## Notes

- **Backward Compatibility:** Old Ethereum env vars still work if you revert
- **Mock Mode:** Application works without blockchain (USE_REAL_BLOCKCHAIN=false)
- **Gradual Migration:** Can test Fabric alongside existing code
- **Security:** Fabric uses certificates instead of private keys
- **Cost:** No gas fees, but requires infrastructure hosting

---

**Last Updated:** [Current Date]
**Status:** Dependencies ready, implementation pending
**Next Action:** Run `npm install` and replace blockchain.js
