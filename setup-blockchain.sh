#!/bin/bash

# TraceRoot Blockchain Setup Script
# This script installs all necessary blockchain dependencies

echo "🚀 TraceRoot Blockchain Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install blockchain dependencies
echo "📦 Installing blockchain dependencies..."
echo ""

# Core blockchain libraries
npm install --save ethers@6.13.4

# Development dependencies
npm install --save-dev hardhat@2.22.15 @nomicfoundation/hardhat-toolbox@5.0.0

# Optional: IPFS for image storage
read -p "Install IPFS support? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install --save ipfs-http-client
    echo "✅ IPFS support installed"
fi

# Optional: Ganache for local testing
read -p "Install Ganache for local blockchain? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install --save-dev ganache
    echo "✅ Ganache installed"
fi

echo ""
echo "✅ All dependencies installed!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your configuration!"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "=============================="
echo "🎉 Setup Complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Update .env with your blockchain credentials"
echo "2. Get Infura API key: https://infura.io/"
echo "3. Setup MetaMask wallet"
echo "4. Get test ETH from faucet"
echo "5. Deploy contracts: npm run hardhat:deploy:sepolia"
echo "6. Test setup: npm run blockchain:test"
echo ""
echo "📚 See SECURITY_CONFIG.md for detailed instructions"
echo ""
