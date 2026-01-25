#!/bin/bash

# TraceRoot Replit Auto-Setup Script
# Run this in Replit terminal: bash REPLIT_SETUP.sh

set -e

echo "🚀 TraceRoot Replit Setup"
echo "========================="
echo ""

# Step 1: Install dependencies
echo "📦 Installing Node dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Replit Docker may not be available."
    echo "⚠️  Your Replit plan may not support Docker."
    exit 1
fi
echo "✅ Docker is available"
echo ""

# Step 3: Setup Fabric Network
echo "⚙️  Setting up Hyperledger Fabric network..."
cd fabric-network

# Make network script executable
chmod +x network.sh

echo "Starting Fabric network..."
./network.sh up createChannel

echo "✅ Fabric network is running"
echo ""

# Step 4: Enroll users
echo "👤 Enrolling admin and users..."
cd ../scripts
node enroll.js
echo "✅ Users enrolled"
echo ""

# Step 5: Start Next.js
cd ..
echo "🌐 Starting Next.js application..."
echo ""
echo "Your app will be available at:"
echo "https://your-replit-url.replit.dev"
echo ""
echo "Run: npm run dev"
