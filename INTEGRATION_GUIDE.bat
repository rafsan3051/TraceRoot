@echo off
REM TraceRoot Price Analytics - Quick Integration Guide (Windows)
REM Run these steps to activate all 5 features

echo.
echo ========================================
echo TraceRoot Price Analytics Integration
echo ========================================
echo.

REM Step 1: Verify all files are in place
echo Step 1: Verifying files...
echo.

setlocal enabledelayedexpansion
set FILES=chaincode\traceroot\price-contract.js lib\event-listener.js lib\notifications.js components\price-history.jsx components\price-analytics.jsx app\api\price\[id]\route.js app\api\analytics\price\[id]\route.js contracts\SupplyChain.sol

for %%F in (%FILES%) do (
  if exist "%%F" (
    echo   ✓ %%F
  ) else (
    echo   ✗ %%F MISSING
  )
)

echo.
echo Step 2: Environment Configuration
echo.
echo   Set in .env.local:
echo   - SUPPLY_CHAIN_CONTRACT_ADDRESS=0x...
echo   - USE_REAL_BLOCKCHAIN=false (or true for testnet/mainnet)
echo   - DATABASE_URL=mongodb://...
echo   - RESEND_API_KEY=... (for email notifications)

echo.
echo Step 3: Database Schema
echo.
echo   Required Prisma models:
echo   - AuditLog (for price indexing)
echo   - ProductWatch (for notifications)
echo   Run: npx prisma migrate dev --name add_price_analytics

echo.
echo Step 4: Activate Event Listener
echo.
echo   Add to app\layout.jsx or middleware:
echo   import { startEventListener } from '@/lib/event-listener';
echo   await startEventListener(); // Call on server boot

echo.
echo Step 5: Integration Points
echo.
echo   1. Add to product page:
echo      ^<PriceHistory productId={id} canEdit={role !== 'CONSUMER'} /^>
echo   2. Add analytics route:
echo      ^<PriceAnalyticsDashboard productId={id} /^>
echo   3. Enable notifications on price POST:
echo      await notifyPriceChange(id, oldPrice, newPrice, product);

echo.
echo Step 6: Test Endpoints
echo.
echo   # Start dev server
echo   npm run dev
echo.
echo   # Test price API (in browser or PowerShell)
echo   Invoke-WebRequest -Uri "http://localhost:3000/api/price/rice-product-001"
echo.
echo   # Test analytics
echo   Invoke-WebRequest -Uri "http://localhost:3000/api/analytics/price/rice-product-001?range=30d"

echo.
echo Step 7: Deploy Checklist
echo.
echo   [ ] Environment variables configured
echo   [ ] Prisma migrations applied
echo   [ ] Event listener started on server boot
echo   [ ] Notifications integrated in price POST
echo   [ ] Fabric chaincode deployed (if using Fabric)
echo   [ ] Email service configured
echo   [ ] Analytics dashboard embedded in UI
echo   [ ] E2E test: edit price ^> verify event capture ^> check analytics

echo.
echo ✓ All set! Ready to track prices.
echo.

pause
