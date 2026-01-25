# ✅ TraceRoot Replit Deployment Checklist

Print this out or follow it digitally. Check off each step as you complete it!

---

## 📋 Pre-Deployment (Prepare Your Code)

- [ ] **Run locally first**
  ```bash
  npm install
  npm run dev
  cd fabric-network && ./network.sh up createChannel
  ```
  - [ ] Next.js app works locally
  - [ ] Fabric network starts without errors
  - [ ] Can call API endpoints

- [ ] **Commit to GitHub** (if using GitHub import)
  ```bash
  git add .
  git commit -m "Ready for Replit deployment"
  git push origin main
  ```

- [ ] **Back up wallet files**
  - [ ] Copy `fabric-network/crypto-config/` somewhere safe
  - [ ] Copy `fabric-network/wallet/` somewhere safe

---

## 🌐 Replit Setup

- [ ] **Create Replit Account**
  - [ ] Go to https://replit.com
  - [ ] Sign up (no credit card!)
  - [ ] Verify email

- [ ] **Import Project**
  - [ ] Click "Create Repl"
  - [ ] Choose "Import from GitHub"
  - [ ] Paste TraceRoot URL
  - [ ] Click "Import"
  - [ ] Wait for import to complete (1-2 mins)

---

## 🚀 Deploy (Run Setup)

- [ ] **Open Replit Terminal**
  - [ ] Look for terminal at bottom of screen
  - [ ] Click to activate

- [ ] **Run Auto Setup Script**
  ```bash
  bash AUTO_SETUP.sh
  ```
  - [ ] Dependencies install (1-2 mins)
  - [ ] Fabric network starts (2-3 mins)
  - [ ] Users get enrolled
  - [ ] Setup completes successfully

  **⏰ Total time: 3-4 minutes**

- [ ] **If Auto Setup Fails:**
  - [ ] Check error message
  - [ ] Try minimal config:
    ```bash
    cp docker-compose.minimal.yml fabric-network/docker-compose.yml
    bash AUTO_SETUP.sh
    ```
  - [ ] If still failing, try ultra-minimal:
    ```bash
    cp docker-compose.ultra-minimal.yml fabric-network/docker-compose.yml
    bash AUTO_SETUP.sh
    ```

---

## 🌐 Start Application

- [ ] **Start Next.js Server**
  ```bash
  npm run dev
  ```
  
- [ ] **Wait for Server**
  - [ ] See message: "ready - started server on..."
  - [ ] Don't refresh immediately

- [ ] **Get Your Live URL**
  - [ ] Replit shows URL like: `https://your-project-name.replit.dev`
  - [ ] Copy this URL
  - [ ] Test it in a new browser tab

---

## 🧪 Verify It Works

- [ ] **Test Homepage**
  - [ ] Open your Replit URL
  - [ ] Should see your Next.js app
  - [ ] CSS is styling correctly (not white page)

- [ ] **Test API Endpoints**
  - [ ] Try health check:
    ```
    https://your-project.replit.dev/api/health
    ```
  - [ ] Should return JSON response

- [ ] **Check Fabric Network**
  - [ ] In Replit terminal, run:
    ```bash
    docker ps
    ```
  - [ ] Should see containers running:
    - [ ] ca.org1.example.com
    - [ ] orderer.example.com
    - [ ] peer0.org1.example.com

- [ ] **Check Logs for Errors**
  ```bash
  docker logs peer0.org1.example.com
  ```
  - [ ] Should not show error messages
  - [ ] Should show "peer started successfully"

---

## 📢 Share with Reviewers

- [ ] **Prepare Information Package**
  - [ ] Copy your Replit URL
  - [ ] Write a short description:
    ```
    Hi! Here's my TraceRoot project running live on Replit:
    [your-url]
    
    The project includes:
    ✅ Next.js full-stack application
    ✅ Hyperledger Fabric blockchain network
    ✅ Smart contracts for supply chain tracking
    ✅ REST API for blockchain interaction
    
    The network is live 24/7 and can handle requests!
    ```

- [ ] **Send URL to Reviewers**
  - [ ] Email the URL
  - [ ] Add to your portfolio
  - [ ] Share in submission form

- [ ] **Include Links to Docs**
  - [ ] Link to QUICK_START_REPLIT.md in your README
  - [ ] Link to ARCHITECTURE_GUIDE.md for technical details

---

## 🔒 Security Checklist

- [ ] **Don't commit private keys** (already safe in .gitignore)
- [ ] **Don't expose wallet credentials** in URLs
- [ ] **Don't hardcode passwords** in code
- [ ] **Environment variables** are secret (good!)

---

## 📊 Performance Verification

- [ ] **Page load time**: < 3 seconds
- [ ] **API response**: < 2 seconds
- [ ] **No 404 errors** in console
- [ ] **No error logs** in terminal

---

## 🎯 Success Indicators

If you see these, you're DONE! ✅

- [ ] ✅ Replit URL works in browser
- [ ] ✅ Your website displays correctly
- [ ] ✅ Next.js app is responsive
- [ ] ✅ Docker containers are running
- [ ] ✅ No critical errors in logs
- [ ] ✅ API endpoints respond
- [ ] ✅ Can share URL with anyone
- [ ] ✅ Works on mobile browsers too

---

## 🆘 Troubleshooting Quick Reference

### "Docker not found"
→ Replit Docker may not be available on your plan. Try Gitpod instead.

### "Out of memory"
→ Use minimal docker-compose. See above.

### "Peer won't start"
→ Wait 3 mins. Containers need time to initialize.

### "API is slow"
→ Normal on free tier. Expected.

### "Certificate errors"
→ Re-run: `node scripts/enroll.js`

### "Can't connect to peer"
→ Check ports in `.replit` are correct.

### "Getting 404 on API calls"
→ Check route names match `/app/api/*` files.

**For more help**: See REPLIT_DEPLOYMENT_GUIDE.md

---

## 📝 Documentation Files

You now have these guides:

| File | When to Use |
|------|------------|
| QUICK_START_REPLIT.md | **First time setup** |
| AUTO_SETUP.sh | **Easiest setup (run this!)** |
| ARCHITECTURE_GUIDE.md | **Understand how it works** |
| REPLIT_DEPLOYMENT_GUIDE.md | **Troubleshooting help** |
| REPLIT_SETUP_README.md | **Complete reference** |
| DEPLOYMENT_COMPLETE.md | **Overview of what was done** |

---

## ⏱️ Time Estimate

```
Task                          Time
────────────────────────────────────
Create Replit account         2-3 min
Import project                1-2 min
Run AUTO_SETUP.sh            3-5 min
Start npm run dev             ~1 min
Test and verify              2-3 min
────────────────────────────────────
TOTAL:                       ~10 min
```

**From zero to live: 10 minutes!**

---

## 🎉 You Did It!

Once you check off all items above:

1. ✅ Your Hyperledger Fabric is LIVE
2. ✅ Your project is ACCESSIBLE
3. ✅ Reviewers can see it WORKING
4. ✅ It shows REAL blockchain

**Share your URL. Get approved. 🚀**

---

## 📞 Support

Still stuck? Check these in order:

1. **QUICK_START_REPLIT.md** - Most issues covered
2. **REPLIT_DEPLOYMENT_GUIDE.md** - Detailed troubleshooting
3. **ARCHITECTURE_GUIDE.md** - Understand system
4. **Replit Docs** - https://docs.replit.com

---

**Congratulations! Your deployment is configured. Now just follow this checklist! ✨**
