# Blockchain Configuration for Kaleido

## Overview
The TraceRoot application is now configured to write all product registrations and supply chain updates directly to the Kaleido Hyperledger Fabric blockchain. Transactions will be visible in the Kaleido blockchain explorer.

## Configuration

### Environment Variables (Already Set in .env)
```
USE_REAL_BLOCKCHAIN=true
KALEIDO_REST_API=https://e1i8a4oupg-e1ggy1f70s-connect.eu1-azure-ws.kaleido.io/
KALEIDO_AUTH_HEADER=Basic ZTFmbGNiYXlhMzozRU1aSFpQbmVuaDFyOWVRQ1JhVUVUUUVCTkF5Z3E4bHZqRE5zeU92Y2dR
HYPERLEDGER_CHANNEL_NAME=default-channel
HYPERLEDGER_CHAINCODE_NAME=traceroot
KALEIDO_SIGNER=e1ggy1f70s-admin
FABCONNECT_USE_GATEWAY=true
```

### Blockchain Explorer Access
View your transactions here:
```
https://e1i8a4oupg-e1ggy1f70s-explorer.eu1-azure-ws.kaleido.io/
```

## How It Works

### 1. Product Registration
When a farmer registers a product via `/api/product`:
- Product data is sent to Kaleido FabConnect REST API
- Chaincode `RegisterProduct` function is invoked
- Transaction is recorded on the Kaleido blockchain
- Transaction ID is returned and stored in MongoDB
- **View in Explorer**: Search by transaction ID

### 2. Supply Chain Updates
When a supply chain event is recorded via `/api/update`:
- Event (e.g., "In Transit", "At Warehouse") is sent to blockchain
- Chaincode records the event with location and timestamp
- Event is linked to the product's blockchain record
- **View in Explorer**: Track product movement in real-time

## Data Recorded on Blockchain

### Product Registration
```javascript
{
  id: "unique_transaction_id",
  name: "Product Name",
  origin: "Farm Location",
  category: "Vegetable/Fruit/etc",
  manufacturer: "Farmer Name",
  mfgDate: "ISO timestamp",
  description: "Product details",
  price: "Price in currency",
  farmerId: "User ID",
  registeredAt: "Timestamp",
  location: "GPS coordinates"
}
```

### Supply Chain Event
```javascript
{
  id: "unique_transaction_id",
  name: "Supply Chain Event - [EventType]",
  origin: "Current Location",
  category: "EventType (In Transit, At Warehouse, etc)",
  productId: "Product ID",
  eventType: "Event Type",
  location: "Location Name",
  latitude/longitude: "GPS coordinates",
  userId: "User who recorded event"
}
```

## Testing

### 1. Register a Product
```bash
curl -X POST http://localhost:3000/api/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tomato",
    "origin": "Farm District",
    "manufactureDate": "2026-01-28",
    "category": "Vegetables",
    "description": "Fresh tomatoes",
    "price": 100
  }'
```

### 2. Record a Supply Chain Event
```bash
curl -X POST http://localhost:3000/api/update \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_FROM_RESPONSE",
    "eventType": "In Transit",
    "location": "District Warehouse",
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

### 3. View in Kaleido Explorer
- Go to: https://e1i8a4oupg-e1ggy1f70s-explorer.eu1-azure-ws.kaleido.io/
- Search for transaction ID in the search bar
- View all transaction details, chaincode invocations, and ledger entries

## Key Features

✅ **Immutable Records**: All product data is permanently recorded on blockchain
✅ **Real-time Tracking**: Supply chain events are instantly recorded
✅ **Explorer Visibility**: All transactions visible in Kaleido blockchain explorer
✅ **Dual Storage**: Data stored in both blockchain (ledger) and MongoDB (app database)
✅ **Error Handling**: If blockchain is temporarily unavailable, transactions are queued and synced later
✅ **GPS Tracking**: Location data recorded with each transaction
✅ **Farmer Verification**: Only verified farmers can register products

## Blockchain Explorer URLs

- **Main Network**: https://e1i8a4oupg-e1ggy1f70s-explorer.eu1-azure-ws.kaleido.io/
- **REST API**: https://e1i8a4oupg-e1ggy1f70s-connect.eu1-azure-ws.kaleido.io/
- **Peer Node**: https://e1i8a4oupg-e1ggy1f70s-peer.eu1-azure-ws.kaleido.io/

## Troubleshooting

### Transaction Not Appearing in Explorer
1. Check that `USE_REAL_BLOCKCHAIN=true` in .env
2. Verify `KALEIDO_REST_API` endpoint is correct
3. Check server logs for blockchain submission errors
4. Wait 10-30 seconds for block confirmation on Kaleido

### "Could not launch chaincode" Error
- The chaincode `traceroot:1.0.0` must be deployed on Kaleido
- Contact Kaleido support to verify chaincode deployment status
- Ensure `HYPERLEDGER_CHAINCODE_NAME=traceroot` (lowercase)

### Authentication Failed
- Verify `KALEIDO_AUTH_HEADER` is correct (must include "Basic" prefix)
- Check that credentials haven't expired in Kaleido dashboard
- Regenerate credentials if needed and update .env

## Production Deployment

For Vercel/production:
1. Ensure all Kaleido credentials are set in Vercel environment variables
2. Use the same .env variables in Vercel dashboard
3. Test product registration endpoint after deployment
4. Monitor Kaleido explorer for transaction confirmation

---
**Last Updated**: January 28, 2026
**Configuration Status**: ✅ Properly Configured
