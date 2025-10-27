# 🚀 TraceRoot - Quick Start

## ✅ What's Working Now

- ✅ Docker Desktop running
- ✅ Fabric CA enrolled (admin + appUser identities in wallet)
- ✅ App runs in mock blockchain mode
- ✅ All features functional

## 🎯 Start Developing Right Now

```powershell
cd h:\VSCODE\trace-root
npm run dev
```

Your app is at: http://localhost:3000

## 🔑 Admin Enrolled!

Your Fabric admin is enrolled and ready:
- **Admin ID**: `admin` (credentials in `wallet/admin.id`)
- **App User**: `appUser` (credentials in `wallet/appUser.id`)
- **CA URL**: https://localhost:7054

## 📦 What's Running

```
✅ ca_org1 (port 7054) - Certificate Authority
✅ ca_org2 (port 8054) - Certificate Authority
✅ ca_orderer (port 9054) - Certificate Authority  
✅ orderer.example.com (ports 7050, 7053, 9443) - Orderer
❌ peer0.org1 (not running - known Docker image issue)
❌ peer0.org2 (not running - known Docker image issue)
```

## 🔄 Network Commands

```powershell
# Check what's running
docker ps

# Restart CA services
cd H:\VSCODE\fabric-samples\test-network
docker-compose -f compose/compose-ca.yaml restart

# Stop all Fabric containers
docker-compose -f compose/compose-ca.yaml -f compose/compose-test-net.yaml down
```

## 🎓 Next Steps

**For Development** (Now):
- Keep `USE_REAL_BLOCKCHAIN="false"` in `.env`
- Build features, test UI, develop normally
- Everything works in mock mode

**For Production** (Later):
1. Fix peer containers (see `DOCKER_FABRIC_SETUP_STATUS.md`)
2. Deploy chaincode to network
3. Set `USE_REAL_BLOCKCHAIN="true"`
4. Test with real Fabric

---

**Status**: ✅ Ready for development | ⚠️ Peers need fixing for production
