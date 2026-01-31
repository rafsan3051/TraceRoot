# TraceRoot

Short guide to run locally with Kaleido (real blockchain) and deploy.

## Prerequisites

- Node.js 18+ and npm
- MongoDB connection string
- Kaleido Hyperledger Fabric environment (REST API, App ID/Secret)

## Local setup (real blockchain)

1. Install dependencies:

   - npm install
2. Configure .env (minimum):

   - DATABASE_URL
   - USE_REAL_BLOCKCHAIN=true
   - KALEIDO_REST_API
   - KALEIDO_APP_ID
   - KALEIDO_APP_SECRET
   - KALEIDO_AUTH_HEADER (Basic base64 of KALEIDO_APP_ID:KALEIDO_APP_SECRET)
   - KALEIDO_SIGNER (e.g., peerId-admin)
   - HYPERLEDGER_CHANNEL_NAME
   - HYPERLEDGER_CHAINCODE_NAME
3. Verify Kaleido credentials:

   - npm run kaleido:test
4. Seed database (optional):

   - npm run fresh-seed
5. Start the app:

   - npm run dev
   - Open <http://localhost:3000>

## Hosting (Vercel)

1. Push the repository to GitHub.
2. Create a Vercel project from the repo.
3. Add the same .env values in Vercel Project Settings → Environment Variables.
4. Deploy.

## Notes

- For QR links in production, set NEXT_PUBLIC_APP_URL to your deployed URL.
- Kaleido returns 401 if KALEIDO_AUTH_HEADER is incorrect.
