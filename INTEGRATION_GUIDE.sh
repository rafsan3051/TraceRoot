#!/bin/bash

# TraceRoot Price Analytics - Quick Integration Guide
# Run these steps to activate all 5 features

echo "🚀 TraceRoot Price Analytics Integration"
echo "=========================================="

# Step 1: Verify all files are in place
echo -e "\n📋 Step 1: Verifying files..."
FILES=(
  "chaincode/traceroot/price-contract.js"
  "lib/event-listener.js"
  "lib/notifications.js"
  "components/price-history.jsx"
  "components/price-analytics.jsx"
  "app/api/price/[id]/route.js"
  "app/api/analytics/price/[id]/route.js"
  "contracts/SupplyChain.sol"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
  fi
done

# Step 2: Check environment setup
echo -e "\n🔧 Step 2: Environment Configuration"
echo "  Set in .env.local:"
echo "  - SUPPLY_CHAIN_CONTRACT_ADDRESS=0x..."
echo "  - USE_REAL_BLOCKCHAIN=false (or true for testnet/mainnet)"
echo "  - DATABASE_URL=mongodb://..."
echo "  - RESEND_API_KEY=... (for email notifications)"

# Step 3: Database schema
echo -e "\n💾 Step 3: Database Schema"
echo "  Required Prisma models:"
echo "  - AuditLog (for price indexing)"
echo "  - ProductWatch (for notifications)"
echo "  Run: npx prisma migrate dev --name add_price_analytics"

# Step 4: Start event listener
echo -e "\n⚡ Step 4: Activate Event Listener"
echo "  Add to app/layout.jsx or middleware:"
echo "  import { startEventListener } from '@/lib/event-listener';"
echo "  await startEventListener(); // Call on server boot"

# Step 5: Integration points
echo -e "\n🔌 Step 5: Integration Points"
echo "  1. Add to product page:"
echo "     <PriceHistory productId={id} canEdit={role !== 'CONSUMER'} />"
echo "  2. Add analytics route:"
echo "     <PriceAnalyticsDashboard productId={id} />"
echo "  3. Enable notifications on price POST:"
echo "     await notifyPriceChange(id, oldPrice, newPrice, product);"

# Step 6: Test endpoints
echo -e "\n✅ Step 6: Test Endpoints"
echo "  # Start dev server"
echo "  npm run dev"
echo ""
echo "  # Test price API (in browser or curl)"
echo "  curl http://localhost:3000/api/price/rice-product-001"
echo ""
echo "  # Test analytics"
echo "  curl http://localhost:3000/api/analytics/price/rice-product-001?range=30d"

# Step 7: Deploy checklist
echo -e "\n🎯 Step 7: Deploy Checklist"
echo "  [ ] Environment variables configured"
echo "  [ ] Prisma migrations applied"
echo "  [ ] Event listener started on server boot"
echo "  [ ] Notifications integrated in price POST"
echo "  [ ] Fabric chaincode deployed (if using Fabric)"
echo "  [ ] Email service configured"
echo "  [ ] Analytics dashboard embedded in UI"
echo "  [ ] E2E test: edit price → verify event capture → check analytics"

echo -e "\n✨ All set! Ready to track prices. 🚀\n"
