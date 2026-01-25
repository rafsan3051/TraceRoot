#!/bin/bash
# Quick Setup Script for Oracle Cloud Always Free VM
# Run this on your Oracle Ubuntu VM to set up Hyperledger Fabric

set -e

echo "🚀 Setting up Hyperledger Fabric on Oracle Cloud..."
echo "═══════════════════════════════════════════════════"
echo ""

# Get your Oracle public IP
ORACLE_IP=$(curl -s http://169.254.169.254/opc/v1/instance/metadata/publicIp)
echo "📍 Your Oracle VM IP: $ORACLE_IP"
echo ""

# Step 1: Install Docker
echo "📦 Installing Docker..."
sudo apt update -y
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
echo "✅ Docker installed"
echo ""

# Step 2: Clone project or assume it's already there
if [ ! -d "TraceRoot" ]; then
    echo "📥 Cloning TraceRoot project..."
    git clone https://github.com/YOUR_USERNAME/TraceRoot.git
    cd TraceRoot
else
    cd TraceRoot
fi

echo "✅ Project ready"
echo ""

# Step 3: Update connection profile with Oracle IP
echo "🔧 Updating connection profile with Oracle IP..."
cd fabric-network

# Replace localhost with Oracle IP in all files
sed -i "s/localhost/$ORACLE_IP/g" connection-profile.json
sed -i "s/127.0.0.1/$ORACLE_IP/g" docker-compose.yml
sed -i "s/localhost/$ORACLE_IP/g" docker-compose.yml

echo "✅ Connection profile updated"
echo ""

# Step 4: Start Fabric
echo "🚀 Starting Hyperledger Fabric network..."
docker-compose up -d
sleep 10

# Verify containers
if docker ps | grep -q "peer0.org1"; then
    echo "✅ Fabric containers running!"
else
    echo "❌ Error: Containers not running"
    docker-compose logs
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ FABRIC SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📍 Oracle IP: $ORACLE_IP"
echo ""
echo "Next steps:"
echo "1. Enroll admin: bash scripts/enroll-admin.sh"
echo "2. Register user: bash scripts/register-user.sh"
echo "3. Export wallet: bash scripts/export-wallet-for-vercel.sh"
echo "4. Add exported values to Vercel environment"
echo ""
echo "To check logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
