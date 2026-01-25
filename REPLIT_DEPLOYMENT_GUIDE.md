# TraceRoot - Replit Deployment Guide

Deploy your Hyperledger Fabric + Next.js project on Replit (FREE, No Credit Card Required)

## Step 1: Prepare Your Project for Replit

### 1.1 Create a `.replit` file
```bash
# In TraceRoot root directory
```

### 1.2 Update `package.json` scripts
The scripts are already there, but we'll add Replit-specific ones.

## Step 2: Create Replit Account & Import

1. Go to **replit.com**
2. Sign up (no credit card needed)
3. Create a new Replit project OR import from GitHub
4. If you have TraceRoot on GitHub:
   - Click "Import from GitHub"
   - Paste your repo URL
5. If not, upload the project manually

## Step 3: Start Hyperledger Fabric Network

Run these commands in Replit terminal:

```bash
# Navigate to fabric network
cd fabric-network

# Start the network (creates minimal setup for Replit resources)
./network.sh up createChannel

# In a new terminal, enroll admin and user
cd scripts && node enroll.js
```

## Step 4: Deploy Next.js App

```bash
# Back in root directory
npm install

# Start the development server
npm run dev
```

## Step 5: Share Your Project

Replit automatically generates a URL like:
```
https://your-project-name.replit.dev
```

Share this URL with the reviewers!

## Expected Performance

- **Slow startup**: 2-3 minutes (Docker containers need to boot)
- **API responses**: 1-2 seconds (limited resources)
- **Uptime**: Continuous (Replit keeps it running)

## If You Get Memory Errors

The Fabric network might be too heavy. Use the **minimal config**:
- Only 1 peer (instead of 2)
- Only 1 orderer
- Only 1 CA
- Only 1 organization

Edit `fabric-network/docker-compose.yml` to disable extra services.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Docker not found" | Replit has Docker built-in, but containers may fail. Try stopping/restarting |
| "Out of memory" | Reduce Docker containers. See minimal config above |
| "Port already in use" | Kill the old process: `pkill -f docker` |
| Network too slow | Wait 2-3 mins for containers to fully initialize |

---

**Next Steps**: See `REPLIT_SETUP.sh` for automated setup
