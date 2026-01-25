#!/bin/bash
# Export Wallet to Base64 for Vercel Environment Variables
# Run this on the Oracle VM after users are enrolled

set -e

WALLET_PATH="./wallet"
USER_ID="appUser"

echo "🔐 Exporting wallet credentials for Vercel..."

# Get certificate (public key)
CERT_FILE="${WALLET_PATH}/${USER_ID}/signcerts/cert.pem"
if [ ! -f "$CERT_FILE" ]; then
    CERT_FILE="${WALLET_PATH}/${USER_ID}/signcerts/"*".pem"
fi

# Get private key
KEY_FILE="${WALLET_PATH}/${USER_ID}/keystore/"*"_sk"
if [ ! -f "$KEY_FILE" ]; then
    KEY_FILE="${WALLET_PATH}/${USER_ID}/keystore/priv_sk"
fi

# Get connection profile
PROFILE_FILE="./fabric-network/connection-profile.json"

# Encode to base64 (single line)
echo ""
echo "📋 Copy these to Vercel environment variables:"
echo "─────────────────────────────────────────────────"
echo ""
echo "HYPERLEDGER_IDENTITY_CERT_B64:"
cat "$CERT_FILE" | base64 -w 0
echo ""
echo ""
echo "HYPERLEDGER_IDENTITY_KEY_B64:"
cat "$KEY_FILE" | base64 -w 0
echo ""
echo ""
echo "HYPERLEDGER_CONNECTION_PROFILE_B64:"
cat "$PROFILE_FILE" | base64 -w 0
echo ""
echo "─────────────────────────────────────────────────"
echo ""
echo "✅ Export complete! Copy the values above to Vercel."
