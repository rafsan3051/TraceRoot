#!/bin/bash
# Enroll Admin User with Hyperledger Fabric CA
# Run this on the Oracle VM after Fabric network is running

set -e

WALLET_PATH="./wallet"
USER_ID="admin"
FABRIC_CA_CLIENT_HOME=${WALLET_PATH}

# Check if admin already exists
if [ -d "${WALLET_PATH}/admin" ]; then
    echo "✅ Admin already enrolled"
    exit 0
fi

# Wait for CA to be ready
echo "⏳ Waiting for CA to be ready..."
sleep 5

# Enroll admin user with CA
echo "📝 Enrolling admin user..."
npx fabric-ca-client enroll \
  -u http://admin:adminpw@ca.org1.example.com:7054 \
  --caname ca-org1 \
  --tls.certfiles ${PWD}/fabric-network/ca/ca.org1.example.com-cert.pem

echo "✅ Admin enrolled successfully!"
echo "📍 Wallet location: ${WALLET_PATH}"
ls -la ${WALLET_PATH}/
