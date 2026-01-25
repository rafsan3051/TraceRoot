#!/bin/bash
# Register and Enroll Application User with Hyperledger Fabric CA
# Run this on the Oracle VM after admin is enrolled

set -e

WALLET_PATH="./wallet"
USER_ID="appUser"
FABRIC_CA_CLIENT_HOME=${WALLET_PATH}

# Check if user already exists
if [ -d "${WALLET_PATH}/${USER_ID}" ]; then
    echo "✅ User ${USER_ID} already enrolled"
    exit 0
fi

# Register user
echo "📝 Registering user ${USER_ID}..."
npx fabric-ca-client register \
  --caname ca-org1 \
  --id.name ${USER_ID} \
  --id.secret usersecret \
  --id.type client \
  --tls.certfiles ${PWD}/fabric-network/ca/ca.org1.example.com-cert.pem

# Enroll user
echo "📝 Enrolling user ${USER_ID}..."
npx fabric-ca-client enroll \
  -u http://${USER_ID}:usersecret@ca.org1.example.com:7054 \
  --caname ca-org1 \
  --tls.certfiles ${PWD}/fabric-network/ca/ca.org1.example.com-cert.pem \
  --enrollment.attrs "hf.Revoker"

echo "✅ User ${USER_ID} enrolled successfully!"
echo "📍 Wallet location: ${WALLET_PATH}"
ls -la ${WALLET_PATH}/${USER_ID}/
