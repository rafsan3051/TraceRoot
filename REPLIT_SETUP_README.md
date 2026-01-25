# 🎯 Replit Deployment - Complete Setup

Your TraceRoot project is now ready for Replit deployment. Here's everything you need:

## 📋 Files Created

| File | Purpose |
|------|---------|
| `.replit` | Replit configuration (ports, environment) |
| `QUICK_START_REPLIT.md` | **START HERE** - 5 minute setup |
| `REPLIT_DEPLOYMENT_GUIDE.md` | Detailed guide with troubleshooting |
| `REPLIT_SETUP.sh` | Automated setup script |
| `docker-compose.minimal.yml` | Lightweight Fabric (if default fails) |
| `docker-compose.ultra-minimal.yml` | Ultra-lightweight Fabric (last resort) |
| `HEALTH_CHECK_EXAMPLE.js` | Example health endpoint |

---

## 🚀 Quick Path to Success

### For First-Time Users:
1. Read: **QUICK_START_REPLIT.md** (5 mins)
2. Follow steps 1-6
3. Share URL with reviewers ✅

### If You Get Errors:
1. Consult: **REPLIT_DEPLOYMENT_GUIDE.md** (Troubleshooting section)
2. Try: `docker-compose.minimal.yml` (replace existing)
3. Last resort: `docker-compose.ultra-minimal.yml`

---

## 🎬 Here's What Happens

```
You → Replit.com (Free) → Docker Containers
                       ↓
                   Fabric Network
                   (CA, Orderer, Peer)
                       ↓
                   Your Next.js App
                       ↓
                   Live URL (replit.dev)
                       ↓
                   Reviewers can access ✅
```

---

## ✅ What Reviewers Will See

When you share your Replit URL:
1. **Main website** - Your Next.js frontend
2. **Blockchain operations** - Via API endpoints
3. **Live network** - Fabric running in cloud
4. **No "localhost"** - It's a real live URL

---

## 🔧 Configuration Details

### Ports Configured in `.replit`
- `3000` → Next.js app (external port 80)
- `7050` → Orderer
- `7051` → Peer
- `7052` → Peer Chaincode
- `7054` → CA

### Environment Variables
- `NEXT_PUBLIC_API_URL` → Automatically set to Replit URL
- `NODE_ENV` → Set to production

---

## 💡 Pro Tips

### Tip 1: Test Locally First
Before pushing to Replit, test everything locally:
```bash
npm install
npm run dev
```

### Tip 2: Keep It Simple for Reviewers
Don't expose all blockchain complexity. Create simple API endpoints:
- `GET /api/health` → Check if Fabric is running
- `POST /api/fabric/invoke` → Call a chaincode function
- `GET /api/fabric/query` → Query ledger

### Tip 3: Monitor Container Logs
In Replit, check Docker logs:
```bash
docker logs peer0.org1.example.com
```

### Tip 4: Set Sleep Time
If Fabric fails, it might need more startup time. Edit `network.sh`:
```bash
sleep 10  # Increase from default
```

---

## 📊 Expected Performance on Replit

| Metric | Value |
|--------|-------|
| Initial startup | 2-3 minutes |
| API response time | 1-2 seconds |
| Network uptime | 24/7 |
| Max concurrent users | 5-10 |
| Memory available | ~512MB-1GB |

---

## ⚠️ Common Gotchas

### 1. Docker Containers Take Time
First run takes 2-3 minutes. Don't refresh immediately.

### 2. Memory Limits
Replit free tier has limited RAM. If fails:
- Use `docker-compose.minimal.yml`
- Disable non-essential services
- Increase swap: See REPLIT_DEPLOYMENT_GUIDE.md

### 3. Replit Keeps Projects Active
Your app keeps running as long as Replit is up. If you want it to sleep:
- Stop the terminal
- Docker containers will pause

### 4. File System Not Persistent Across Restarts
Keep important data (like wallet credentials) backed up somewhere else.

---

## 🆘 Troubleshooting Quick Links

**Problem → Solution**

| Problem | Solution |
|---------|----------|
| Docker not found | Might not be available on your plan |
| Out of memory | Use `docker-compose.minimal.yml` |
| Peer won't start | Wait 3 mins + check logs |
| API is slow | Normal - free tier is slower |
| Can't connect to peer | Check port 7051 is exposed |
| MSP error | Re-run: `node scripts/enroll.js` |

For more details:
→ **REPLIT_DEPLOYMENT_GUIDE.md**

---

## 📝 Next Steps

1. **Read QUICK_START_REPLIT.md**
2. **Create Replit account** (replit.com)
3. **Import TraceRoot project**
4. **Run 6 steps in QUICK_START_REPLIT.md**
5. **Share URL with reviewers**
6. **Get approval!** 🎉

---

## 🎓 Learning Resources

- **Replit Docs**: https://docs.replit.com
- **Docker Basics**: https://docs.docker.com
- **Fabric Network**: https://hyperledger-fabric.readthedocs.io
- **Next.js**: https://nextjs.org/docs

---

## 💬 Still Stuck?

Check these in order:
1. QUICK_START_REPLIT.md - most common issues
2. REPLIT_DEPLOYMENT_GUIDE.md - detailed troubleshooting
3. Docker logs: `docker logs <container_name>`
4. Replit community: replit.com/community

---

**Good luck! Your project will be live in ~5 minutes. 🚀**
