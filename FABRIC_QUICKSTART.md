# TraceRoot - Hyperledger Fabric Quick Start

## ✅ What's Done

Your TraceRoot app is now configured to use **Hyperledger Fabric** blockchain:

- ✅ Fabric SDK installed (`fabric-network@2.2.19`, `fabric-ca-client@2.2.19`)
- ✅ Blockchain module replaced with Fabric implementation (`lib/blockchain.js`)
- ✅ Chaincode scaffolded (`chaincode/traceroot/`)
- ✅ Network placeholders created (`fabric-network/`)
- ✅ Enrollment & testing scripts ready (`scripts/enroll.js`, `scripts/test-fabric.js`)
- ✅ API routes for enrollment and product registration (`/api/fabric/*`)
- ✅ Build passing, lint clean (0 errors)
- ✅ Safe mock mode by default

## 🚀 Quick Commands

### Development (Mock Mode - No Fabric Required)

```powershell
cd h:\VSCODE\trace-root
npm run dev
```

Your app runs normally in mock mode. All blockchain calls return mock transaction IDs.

### Enroll Identities (Once Fabric Network is Running)

```powershell
# Option 1: Via script
npm run fabric:enroll

# Option 2: Via API (dev only)
curl -X POST http://localhost:3000/api/fabric/enroll
```

### Test Fabric Connectivity

```powershell
npm run fabric:test
```

### Register a Product on Fabric

```powershell
# Via API
curl -X POST http://localhost:3000/api/fabric/register \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "name": "Test Product",
    "origin": "Test Farm",
    "category": "Test"
  }'
```

## 📋 Environment Setup

Add these to your `.env` file:

```bash
# Blockchain Mode
USE_REAL_BLOCKCHAIN="false"
BLOCKCHAIN_NETWORK="hyperledger"

# Hyperledger Fabric
HYPERLEDGER_CONNECTION_PROFILE="./fabric-network/connection-profile.json"
HYPERLEDGER_WALLET_PATH="./wallet"
HYPERLEDGER_USER_ID="appUser"
HYPERLEDGER_CHANNEL_NAME="tracerootchannel"
HYPERLEDGER_CHAINCODE_NAME="traceroot"
HYPERLEDGER_MSP_ID="Org1MSP"
HYPERLEDGER_PEER_ENDPOINT="localhost:7051"
HYPERLEDGER_CA_ENDPOINT="localhost:7054"
HYPERLEDGER_CA_ADMIN_ID="admin"
HYPERLEDGER_CA_ADMIN_SECRET="adminpw"

# Optional: Protect enrollment API
FABRIC_ENROLL_KEY="your-secret-key"
```

## 🌐 Running a Local Fabric Network

### Option 1: Use fabric-samples test-network (Recommended)

```bash
# Prerequisites: Docker Desktop, Git Bash (Windows) or Linux/macOS terminal

# 1. Clone fabric-samples
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network

# 2. Start network with CA
./network.sh up createChannel -ca

# 3. Install chaincode dependencies
cd ../../trace-root/chaincode/traceroot
npm install

# 4. Package chaincode (back in test-network)
cd ../../fabric-samples/test-network
peer lifecycle chaincode package traceroot.tar.gz \
  --path ../../trace-root/chaincode/traceroot \
  --lang node \
  --label traceroot_1.0

# 5. Install on peer
peer lifecycle chaincode install traceroot.tar.gz

# 6. Approve and commit (see fabric-samples docs for full lifecycle)
```

### Option 2: Link to Your Network

If you already have a Fabric network:

1. Update `fabric-network/connection-profile.json` with your network's:
   - Peer endpoints
   - CA endpoints
   - TLS certificates (replace `REPLACE_WITH_TLS_CA_CERT` and `REPLACE_WITH_CA_CERT`)
   - MSP ID

2. Deploy the chaincode from `chaincode/traceroot/` to your network

3. Enroll identities:
   ```powershell
   npm run fabric:enroll
   ```

4. Test connectivity:
   ```powershell
   npm run fabric:test
   ```

5. Enable real blockchain:
   ```bash
   USE_REAL_BLOCKCHAIN="true"
   ```

## 📦 Chaincode Functions

Your chaincode (`chaincode/traceroot/lib/traceroot-contract.js`) supports:

- `RegisterProduct(productId, name, origin, category, dataJson)` - Register a new product
- `RecordEvent(productId, eventType, location, dataJson)` - Record supply chain event
- `GetProduct(productId)` - Query product details
- `GetProductHistory(productId)` - Get full product history from ledger
- `TransferOwnership(productId, newOwner)` - Transfer product ownership

## 🔧 Troubleshooting

### "Module not found: fabric-network"
- Run `npm install` in `trace-root/`

### "User 'appUser' not found in wallet"
- Run `npm run fabric:enroll` to create identities
- Or call `POST /api/fabric/enroll` via API

### "Connection profile not found"
- Ensure `fabric-network/connection-profile.json` exists
- Update with real network details (certificates, endpoints)

### "Chaincode not found"
- Deploy chaincode to your Fabric network first
- Follow fabric-samples lifecycle: package → install → approve → commit

### Build errors
- All TypeScript/lint errors resolved
- Only 2 config warnings (safe to ignore)
- Build passes: `npm run build` ✅

## 📚 Documentation

- Full migration guide: `HYPERLEDGER_FABRIC_MIGRATION.md`
- Fabric docs: https://hyperledger-fabric.readthedocs.io/
- fabric-samples: https://github.com/hyperledger/fabric-samples

## 🎯 Next Steps

1. **Keep developing in mock mode** (current setup)
2. **When ready**: Set up fabric-samples/test-network
3. **Deploy chaincode** to your network
4. **Enroll identities** with `npm run fabric:enroll`
5. **Flip to real Fabric**: Set `USE_REAL_BLOCKCHAIN="true"`
6. **Test end-to-end**: Register product → query history → verify on blockchain

---

**Status**: Ready for development ✅  
**Fabric Network**: Required for production use ⚠️  
**Mock Mode**: Fully functional 🟢
