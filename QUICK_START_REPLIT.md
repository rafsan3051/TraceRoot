# 🚀 QUICK START: Deploy TraceRoot on Replit (5 minutes)

## What You'll Get
✅ Live Hyperledger Fabric network running in the cloud  
✅ Free URL to share with reviewers  
✅ No credit card required  
✅ Continuous uptime  

---

## Step 1: Create Replit Account (1 min)
1. Go to **replit.com**
2. Click "Sign up"
3. Sign up with email/GitHub (no credit card)
4. Verify email

---

## Step 2: Import TraceRoot Project (1 min)

**Option A: From GitHub (Recommended)**
1. In Replit, click "Create Repl"
2. Select "Import from GitHub"
3. Paste your TraceRoot repo URL
4. Click "Import"

**Option B: Manual Upload**
1. In Replit, create new Node.js Repl
2. Upload your TraceRoot files
3. Extract them

---

## Step 3: Start Fabric Network (2 mins)

In Replit terminal, run:

```bash
cd fabric-network
chmod +x network.sh
./network.sh up createChannel
```

⏳ **Wait 1-2 minutes** for containers to start

---

## Step 4: Enroll Users (30 secs)

In a **new terminal tab**:

```bash
cd scripts
node enroll.js
```

---

## Step 5: Start Your App (30 secs)

In **another new terminal tab**:

```bash
npm install
npm run dev
```

---

## Step 6: Get Your Live URL

Replit automatically shows your URL:
```
https://your-project-name.replit.dev
```

**Share this URL with reviewers!** ✅

---

## Common Issues & Fixes

### ❌ "Docker not found"
→ Replit Docker might be unavailable. Try:
```bash
docker --version
```

### ❌ "Out of memory"
→ Use minimal Docker config:
```bash
cp docker-compose.minimal.yml fabric-network/docker-compose.yml
```

### ❌ "Peer failed to start"
→ Give it more time (2-3 mins). Containers need initialization.

### ❌ API calls are slow
→ Normal on Replit. Expected 1-2 sec delay.

---

## File Structure Created

```
TraceRoot/
├── .replit                          # Replit config (created)
├── REPLIT_DEPLOYMENT_GUIDE.md       # Full guide (created)
├── REPLIT_SETUP.sh                  # Auto-setup script (created)
├── docker-compose.minimal.yml       # Lightweight config (created)
├── package.json                     # Already configured
├── fabric-network/                  # Your Fabric setup
│   ├── network.sh
│   ├── docker-compose.yml
│   └── crypto-config/
├── app/
│   ├── api/
│   │   └── fabric/                  # Your API endpoints
│   └── page.tsx
└── scripts/
    └── enroll.js
```

---

## Next: Show Reviewers

Once running, send them:
1. **URL**: `https://your-replit-url.replit.dev`
2. **API Endpoints**: They can test via the Next.js frontend
3. **Blockchain Status**: Should show "Network Active"

---

## Cost & Limitations

| Aspect | Details |
|--------|---------|
| **Cost** | FREE |
| **Credit Card** | NOT REQUIRED |
| **Uptime** | 24/7 |
| **Performance** | Moderate (Replit is free tier) |
| **Bandwidth** | Limited (fair usage) |

---

## Still Having Issues?

Try the detailed guide:
```
→ See REPLIT_DEPLOYMENT_GUIDE.md
```

**Good luck! 🚀**
