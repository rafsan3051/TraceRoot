# Blockchain Setup Guide for TraceRoot

This guide will help you set up the blockchain infrastructure for TraceRoot.

## Option 1: Ethereum/Polygon (Recommended for Production)

### Prerequisites
- Node.js 18+ installed
- MetaMask wallet
- Infura or Alchemy account

### Step 1: Install Dependencies
```bash
npm install ethers hardhat @nomicfoundation/hardhat-toolbox
```

### Step 2: Get API Keys

1. **Infura** (https://infura.io/)
   - Sign up for free account
   - Create new project
   - Copy Project ID
   - Add to `.env` as `ETHEREUM_TESTNET_RPC_URL`

2. **Alchemy** (Alternative - https://alchemy.com/)
   - Sign up for free account
   - Create new app (Ethereum Sepolia or Polygon Mumbai)
   - Copy API URL

### Step 3: Configure Environment Variables

Update your `.env` file:

```env
# Use Sepolia testnet for development
BLOCKCHAIN_NETWORK="ethereum"
ETHEREUM_TESTNET_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
CHAIN_ID="11155111"

# Your wallet private key (DO NOT share or commit!)
# Export from MetaMask: Account Details > Export Private Key
BLOCKCHAIN_PRIVATE_KEY="your-private-key-here"

# Enable real blockchain
USE_REAL_BLOCKCHAIN="true"
```

### Step 4: Get Test ETH

For Sepolia testnet:
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Get free test ETH

### Step 5: Deploy Smart Contracts

```bash
# Initialize Hardhat
npx hardhat init

# Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, update `.env` with contract addresses:
```env
PRODUCT_REGISTRY_CONTRACT_ADDRESS="0x..."
SUPPLY_CHAIN_CONTRACT_ADDRESS="0x..."
```

---

## Option 2: Local Development with Ganache

### Step 1: Install Ganache
```bash
npm install -g ganache
```

### Step 2: Start Ganache
```bash
ganache --port 8545 --networkId 1337
```

### Step 3: Configure .env
```env
BLOCKCHAIN_NETWORK="ganache"
ETHEREUM_TESTNET_RPC_URL="http://127.0.0.1:8545"
CHAIN_ID="1337"
BLOCKCHAIN_PRIVATE_KEY="0x..." # Use one of Ganache's test accounts
USE_REAL_BLOCKCHAIN="true"
```

---

## Option 3: Polygon (Lower Gas Fees)

### Step 1: Configure for Polygon Mumbai Testnet
```env
BLOCKCHAIN_NETWORK="polygon"
POLYGON_TESTNET_RPC_URL="https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID"
CHAIN_ID="80001"
```

### Step 2: Get Test MATIC
- Visit: https://faucet.polygon.technology/
- Select Mumbai network
- Enter wallet address
- Get free test MATIC

---

## Option 4: Hyperledger Fabric (Enterprise)

### Prerequisites
- Docker & Docker Compose
- Hyperledger Fabric binaries

### Step 1: Install Fabric Dependencies
```bash
npm install fabric-network fabric-ca-client
```

### Step 2: Setup Fabric Network
```bash
# Clone Fabric samples
curl -sSL https://bit.ly/2ysbOFE | bash -s

# Start test network
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel
```

### Step 3: Deploy Chaincode
```bash
# Package chaincode
peer lifecycle chaincode package traceroot.tar.gz --path ./chaincode --lang node

# Install chaincode
./network.sh deployCC -ccn traceroot -ccp ./chaincode -ccl javascript
```

### Step 4: Configure .env
```env
BLOCKCHAIN_NETWORK="hyperledger"
HYPERLEDGER_CONNECTION_PROFILE="./config/connection-profile.json"
HYPERLEDGER_WALLET_PATH="./wallet"
HYPERLEDGER_USER_ID="admin"
HYPERLEDGER_CHANNEL_NAME="mychannel"
HYPERLEDGER_CHAINCODE_NAME="traceroot"
```

---

## Testing Blockchain Integration

### 1. Test Product Registration
```bash
# Run in terminal
curl -X POST http://localhost:3000/api/product \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Product",
    "origin": "Farm A",
    "category": "Vegetables"
  }'
```

### 2. Verify on Blockchain Explorer
- **Sepolia**: https://sepolia.etherscan.io/
- **Polygon Mumbai**: https://mumbai.polygonscan.com/
- Search for your transaction hash

### 3. Check Logs
```bash
npm run dev
# Look for: "⛓️ Blockchain transaction sent: 0x..."
```

---

## Security Best Practices

1. **Never commit `.env` to git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as template

2. **Use separate keys for dev/prod**
   - Development: Test networks with test funds
   - Production: Mainnet with secure key management

3. **Key Management**
   - Consider using AWS Secrets Manager
   - Or HashiCorp Vault for production

4. **Gas Optimization**
   - Set reasonable gas limits
   - Monitor gas prices
   - Batch transactions when possible

---

## Troubleshooting

### "Insufficient funds"
- Get test ETH/MATIC from faucets
- Check wallet balance

### "Transaction failed"
- Check gas limit in `.env`
- Verify contract addresses
- Check RPC URL is correct

### "Cannot connect to network"
- Verify RPC URL is active
- Check Infura/Alchemy API key
- Test network connectivity

---

## Production Deployment

### Before going to mainnet:

1. **Audit smart contracts**
   - Use OpenZeppelin Defender
   - Get professional audit

2. **Test thoroughly**
   - Unit tests
   - Integration tests
   - Testnet deployment

3. **Set up monitoring**
   - Transaction monitoring
   - Gas price alerts
   - Error tracking

4. **Backup strategy**
   - Store private keys securely
   - Multi-sig wallet for critical operations
   - Disaster recovery plan

---

## Cost Estimation

### Ethereum Mainnet (High)
- Product registration: ~$10-50 per transaction
- Better for high-value supply chains

### Polygon Mainnet (Low)
- Product registration: ~$0.01-0.10 per transaction
- Recommended for most use cases

### Hyperledger Fabric (Zero)
- No transaction fees
- Better for enterprise/private networks
- Requires infrastructure maintenance

---

## Next Steps

1. Choose your blockchain network
2. Follow setup steps for your chosen option
3. Deploy smart contracts
4. Update `.env` with contract addresses
5. Set `USE_REAL_BLOCKCHAIN="true"`
6. Test product registration
7. Monitor transactions on block explorer

For questions or issues, refer to:
- Ethereum: https://ethereum.org/en/developers/
- Polygon: https://wiki.polygon.technology/
- Hyperledger: https://hyperledger-fabric.readthedocs.io/
