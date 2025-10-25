# 🔐 Security Configuration Guide

## Environment Variables Overview

TraceRoot uses environment variables to securely store sensitive configuration. **NEVER commit your `.env` file to version control!**

## Quick Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Generate a strong JWT secret
- [ ] Choose blockchain network (Ethereum/Polygon/Ganache)
- [ ] Get RPC URL from Infura or Alchemy
- [ ] Export MetaMask private key
- [ ] Deploy smart contracts
- [ ] Update contract addresses in `.env`
- [ ] Set `USE_REAL_BLOCKCHAIN="true"`

---

## 1. Generate JWT Secret

Your JWT secret is used to sign authentication tokens. Use a strong random string:

### Option A: OpenSSL (Mac/Linux)
```bash
openssl rand -base64 32
```

### Option B: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option C: Online Generator
Visit: https://generate-secret.vercel.app/32

Update `.env`:
```env
JWT_SECRET="your-generated-secret-here"
```

---

## 2. Blockchain Network Selection

### For Development (Recommended)
Use **Sepolia Testnet** (Ethereum) or **Mumbai** (Polygon):

```env
BLOCKCHAIN_NETWORK="ethereum"
ETHEREUM_TESTNET_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
CHAIN_ID="11155111"
USE_REAL_BLOCKCHAIN="true"
```

### For Local Testing
Use **Ganache**:

```env
BLOCKCHAIN_NETWORK="ganache"
ETHEREUM_TESTNET_RPC_URL="http://127.0.0.1:8545"
CHAIN_ID="1337"
USE_REAL_BLOCKCHAIN="true"
```

### For Development Without Blockchain
Use mock mode:

```env
USE_REAL_BLOCKCHAIN="false"
```

---

## 3. Get Blockchain RPC URL

### Infura (Recommended)

1. Go to https://infura.io/
2. Sign up for free account
3. Create new project
4. Select network (Ethereum, Polygon, etc.)
5. Copy your project URL

```env
ETHEREUM_TESTNET_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
```

### Alchemy (Alternative)

1. Go to https://alchemy.com/
2. Create free account
3. Create new app
4. Select network and chain
5. Copy HTTPS URL

```env
ETHEREUM_TESTNET_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
```

---

## 4. Export MetaMask Private Key

⚠️ **WARNING**: Never share your private key! Use a separate wallet for development.

### Steps:

1. Open MetaMask
2. Click on the account menu (top right)
3. Select "Account Details"
4. Click "Show Private Key"
5. Enter your password
6. Copy the private key

```env
BLOCKCHAIN_PRIVATE_KEY="0x1234567890abcdef..." # Your private key here
```

### Security Tips:

- ✅ Use a separate wallet for development
- ✅ Never commit private keys to git
- ✅ Use testnet only for development
- ❌ Never use mainnet private key in development
- ❌ Never share your private key

---

## 5. Get Test Cryptocurrency

You need test ETH or MATIC to deploy contracts and make transactions.

### Ethereum Sepolia
- Faucet: https://sepoliafaucet.com/
- Alternative: https://faucet.quicknode.com/ethereum/sepolia

### Polygon Mumbai
- Faucet: https://faucet.polygon.technology/
- Select "Mumbai" network

### How to use:
1. Copy your wallet address from MetaMask
2. Paste into faucet website
3. Complete captcha
4. Wait for test funds (usually 1-5 minutes)

---

## 6. Deploy Smart Contracts

### Install Hardhat (if not already installed)
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy to Polygon Mumbai
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

### Deploy to Local Ganache
```bash
# First start Ganache
ganache --port 8545

# Then deploy
npx hardhat run scripts/deploy.js --network ganache
```

### After Deployment

The script will output contract addresses. Update your `.env`:

```env
PRODUCT_REGISTRY_CONTRACT_ADDRESS="0xABCDEF123456789..."
SUPPLY_CHAIN_CONTRACT_ADDRESS="0x987654321FEDCBA..."
```

---

## 7. Optional: IPFS for Images

If you want to store product images on IPFS:

### Pinata

1. Sign up at https://www.pinata.cloud/
2. Get API keys from dashboard
3. Update `.env`:

```env
IPFS_API_KEY="your-pinata-api-key"
IPFS_API_SECRET="your-pinata-secret"
IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs/"
```

### NFT.Storage

1. Sign up at https://nft.storage/
2. Get API token
3. Update `.env`:

```env
IPFS_API_KEY="your-nft-storage-token"
```

---

## 8. Verify Your Setup

### Test Database Connection
```bash
npx prisma db push
```

### Test Blockchain Connection
```bash
# Create test file
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_TESTNET_RPC_URL);
provider.getBlockNumber().then(console.log);
"
```

### Start Application
```bash
npm run dev
```

### Test Product Registration
1. Login as farmer
2. Go to `/products/register`
3. Register a test product
4. Check console for blockchain transaction hash
5. Verify on block explorer

---

## Production Security Best Practices

### 1. Key Management

**Never** use development keys in production!

For production, consider:
- **AWS Secrets Manager**: Store secrets in AWS
- **HashiCorp Vault**: Enterprise secret management
- **Environment Variables**: Use hosting platform's secure env vars (Vercel, Railway, etc.)

### 2. Multi-Signature Wallets

For production contract management:
- Use Gnosis Safe: https://gnosis-safe.io/
- Require multiple signatures for critical operations

### 3. Contract Verification

Always verify contracts on block explorer:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### 4. Rate Limiting

Add rate limiting to blockchain endpoints:
```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');

const blockchainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 5. Monitoring

Set up monitoring for:
- Transaction failures
- Gas price spikes
- Wallet balance alerts
- Suspicious activity

Tools:
- **Tenderly**: https://tenderly.co/
- **Defender**: https://www.openzeppelin.com/defender

---

## Troubleshooting

### "Invalid RPC URL"
- Check URL is correct in `.env`
- Verify Infura/Alchemy project is active
- Test URL in browser

### "Insufficient Funds"
- Get test ETH/MATIC from faucets
- Check wallet balance in MetaMask

### "Invalid Private Key"
- Ensure private key starts with `0x`
- Check for extra spaces
- Verify key is for correct network

### "Transaction Failed"
- Check gas limit in `.env`
- Verify contract addresses
- Check wallet has enough balance

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `BLOCKCHAIN_NETWORK` | Yes | ethereum/polygon/ganache |
| `ETHEREUM_TESTNET_RPC_URL` | Yes* | Infura/Alchemy URL |
| `BLOCKCHAIN_PRIVATE_KEY` | Yes* | Wallet private key |
| `PRODUCT_REGISTRY_CONTRACT_ADDRESS` | Yes* | Deployed contract address |
| `SUPPLY_CHAIN_CONTRACT_ADDRESS` | Yes* | Deployed contract address |
| `CHAIN_ID` | Yes* | Network chain ID |
| `USE_REAL_BLOCKCHAIN` | No | true/false (default: false) |
| `IPFS_API_KEY` | No | For image storage |

\* Required only when `USE_REAL_BLOCKCHAIN="true"`

---

## Support

For issues:
1. Check this guide
2. Review `BLOCKCHAIN_SETUP.md`
3. Check console logs
4. Verify all environment variables

Common issues are usually:
- Missing environment variables
- Incorrect RPC URL
- No test funds in wallet
- Wrong network selected

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate new JWT secret
- [ ] Use mainnet RPC URLs
- [ ] Use production wallet (with real funds)
- [ ] Deploy contracts to mainnet
- [ ] Verify contracts on Etherscan
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Audit smart contracts
- [ ] Test disaster recovery
- [ ] Document key management process
- [ ] Set up backup wallets
- [ ] Configure gas price alerts

---

**Remember**: Security is paramount. Never commit secrets to git!
