# TraceRoot - Future Development Guide

## Features for Later Implementation

This document outlines three major feature sets that are ready for implementation when you're ready to expand TraceRoot's capabilities.

---

## 1. Public Verify Page (No Authentication Required)

### Overview
Create a public-facing product verification page that works without login, making QR codes scannable by anyone (consumers, inspectors, etc.).

### Implementation Steps

#### 1.1 Create Verify Page
**File**: `app/verify/[id]/page.jsx`

```jsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Shield, MapPin, Clock, Package } from 'lucide-react'

export default function VerifyPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = searchParams.get('t')
        const version = searchParams.get('v')
        const url = `/api/verify/${id}?${token ? `t=${token}&` : ''}v=${version || ''}`
        
        const res = await fetch(url)
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error)
        
        setProduct(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Verification Failed</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Verified Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border-2 border-green-500 rounded-full">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-700">Product Verified</span>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
          {product.product.imageUrl && (
            <img 
              src={product.product.imageUrl} 
              alt={product.product.name}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{product.product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.product.category}</p>
            
            {product.product.description && (
              <p className="text-sm mb-6">{product.product.description}</p>
            )}

            {/* Origin */}
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Origin</h3>
                <p className="text-sm text-muted-foreground">{product.product.origin}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3 mb-4">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Status</h3>
                <p className="text-sm text-muted-foreground capitalize">{product.product.status}</p>
              </div>
            </div>

            {/* Producer */}
            {product.product.creator && (
              <div className="flex items-start gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {product.product.creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{product.product.creator.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.product.creator.role}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Supply Chain Timeline
              </h2>
              
              <div className="space-y-4">
                {product.events.map((event, idx) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {idx + 1}
                      </div>
                      {idx < product.events.length - 1 && (
                        <div className="h-full w-px bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold">{event.type}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.location?.address && (
                        <p className="text-xs text-muted-foreground mt-1">{event.location.address}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Timestamp */}
            <div className="border-t pt-4 mt-6 text-center text-xs text-muted-foreground">
              Verified on {new Date(product.verifiedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold">TraceRoot</span> blockchain traceability
          </p>
        </div>
      </div>
    </div>
  )
}
```

#### 1.2 Update QR Generation
Change QR links from `/product/[id]` to `/verify/[id]` in `components/qr-code-card.jsx`:

```js
// Line ~56
return `${base}/verify/${productId}?v=${v}`
```

#### 1.3 Add Metadata for Social Sharing
**File**: `app/verify/[id]/opengraph-image.tsx` (optional)

Generates Open Graph images when sharing verification links on social media.

---

## 2. Hyperledger Fabric Production Setup

### Overview
Get the Fabric network fully operational for real blockchain mode. Currently, CA and orderer are running but peers are failing.

### Current Status
- ✅ CA server running
- ✅ Orderer running
- ✅ Admin and appUser enrolled
- ❌ Peer nodes failing (FABRIC_CFG_PATH issue)

### Implementation Steps

#### 2.1 Fix Peer Configuration

**Problem**: Peers exit with "FABRIC_CFG_PATH not found"

**Solution**: Update `fabric-network/docker-compose.yml`

```yaml
peer0.org1.example.com:
  image: hyperledger/fabric-peer:2.5.0  # Use stable 2.5 LTS
  environment:
    - FABRIC_CFG_PATH=/etc/hyperledger/fabric
    - CORE_PEER_ID=peer0.org1.example.com
    - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    - CORE_PEER_LISTENADDRESS=0.0.0.0:7051
    - CORE_PEER_CHAINCODEADDRESS=peer0.org1.example.com:7052
    - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
    - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org1.example.com:7051
    - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051
    - CORE_PEER_LOCALMSPID=Org1MSP
    - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
    - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=fabric-network_default
    - FABRIC_LOGGING_SPEC=INFO
    - CORE_PEER_TLS_ENABLED=true
    - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
    - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
    - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
  volumes:
    - /var/run/:/host/var/run/
    - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/fabric/msp
    - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls:/etc/hyperledger/fabric/tls
    - peer0.org1.example.com:/var/hyperledger/production
  working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
  command: peer node start
  ports:
    - 7051:7051
  networks:
    - fabric-network
```

#### 2.2 Create Channel and Deploy Chaincode

**File**: `fabric-network/create-channel.sh`

```bash
#!/bin/bash

export FABRIC_CFG_PATH=${PWD}/config
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Create channel
peer channel create -o localhost:7050 -c mychannel -f ./channel-artifacts/mychannel.tx --outputBlock ./channel-artifacts/mychannel.block --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Join peer to channel
peer channel join -b ./channel-artifacts/mychannel.block

# Install chaincode
peer lifecycle chaincode package traceroot.tar.gz --path ../chaincode --lang node --label traceroot_1.0

peer lifecycle chaincode install traceroot.tar.gz

# Approve and commit chaincode
export CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')

peer lifecycle chaincode approveformyorg -o localhost:7050 --channelID mychannel --name traceroot --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

peer lifecycle chaincode commit -o localhost:7050 --channelID mychannel --name traceroot --version 1.0 --sequence 1 --tls --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

Run with: `chmod +x create-channel.sh && ./create-channel.sh`

#### 2.3 Toggle Blockchain Mode

Update `.env`:
```env
# Set to true when Fabric is ready
USE_REAL_BLOCKCHAIN=true
BLOCKCHAIN_NETWORK=hyperledger-fabric
```

#### 2.4 Test End-to-End

```bash
npm run fabric:test
```

Should show:
```
✅ Connected to Fabric network
✅ Contract retrieved
✅ Product registered on blockchain
✅ Events recorded
```

### Debugging Commands

```powershell
# Check peer logs
docker logs peer0.org1.example.com

# Check if peers are responding
docker exec peer0.org1.example.com peer channel list

# Restart network clean
cd fabric-network
docker-compose down -v
docker-compose up -d
```

---

## 3. Nice-to-Haves (Progressive Web App, Webhooks, etc.)

### 3.1 Progressive Web App (PWA)

Makes TraceRoot installable on mobile devices and work offline.

#### manifest.json
**File**: `public/manifest.json`

```json
{
  "name": "TraceRoot - Supply Chain Traceability",
  "short_name": "TraceRoot",
  "description": "Blockchain-based supply chain tracking and verification",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### Service Worker
**File**: `public/sw.js`

```js
const CACHE_NAME = 'traceroot-v1'
const OFFLINE_URLS = [
  '/',
  '/verify',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS)
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Cache-first for verify pages
  if (event.request.url.includes('/verify/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone())
            return fetchResponse
          })
        })
      }).catch(() => caches.match('/offline.html'))
    )
  }
})
```

#### Register Service Worker
**File**: `app/layout.tsx`

Add in `<head>`:
```jsx
<Script id="register-sw">
  {`
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
      })
    }
  `}
</Script>
```

### 3.2 Webhooks for ERP Integration

Allow external systems to subscribe to product events.

#### Webhook Model
**File**: `prisma/schema.prisma` (add)

```prisma
model Webhook {
  id          String   @id @default(uuid())
  url         String
  events      String[] // ['product.created', 'event.added']
  secret      String   // For HMAC signature
  active      Boolean  @default(true)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@index([userId])
  @@map("webhooks")
}
```

#### Webhook Dispatcher
**File**: `lib/webhooks/dispatcher.js`

```js
import crypto from 'crypto'

export async function dispatchWebhook(webhook, eventType, payload) {
  if (!webhook.active) return
  if (!webhook.events.includes(eventType)) return

  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TraceRoot-Signature': signature,
        'X-TraceRoot-Event': eventType,
      },
      body: JSON.stringify(payload),
    })

    console.log(`Webhook ${webhook.id} dispatched:`, response.status)
  } catch (error) {
    console.error(`Webhook ${webhook.id} failed:`, error)
  }
}
```

#### Usage in Product API
**File**: `app/api/product/route.js`

```js
import { dispatchWebhook } from '@/lib/webhooks/dispatcher'

// After creating product
const webhooks = await prisma.webhook.findMany({
  where: { 
    userId: auth.user.id,
    active: true 
  }
})

for (const webhook of webhooks) {
  await dispatchWebhook(webhook, 'product.created', {
    productId: product.id,
    name: product.name,
    category: product.category,
    timestamp: new Date().toISOString(),
  })
}
```

### 3.3 Role Refinement: Inspector/Auditor

Add new roles for third-party verification.

#### Update Schema
```prisma
enum Role {
  ADMIN
  FARMER
  DISTRIBUTOR
  RETAILER
  CONSUMER
  INSPECTOR   // NEW
  AUDITOR     // NEW
}
```

#### Inspector Dashboard
**File**: `app/inspect/page.jsx`

Shows assigned inspection tasks, products to verify, QR scanner for field work.

```jsx
'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Shield, Camera } from 'lucide-react'

export default function InspectPage() {
  const { user } = useAuth()

  if (user?.role !== 'INSPECTOR' && user?.role !== 'AUDITOR') {
    return <div>Access denied</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inspection Dashboard</h1>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
        <Camera className="h-5 w-5" />
        Scan Product QR
      </button>

      {/* List of assigned products */}
      {/* Inspection forms */}
      {/* Attach photos/certificates */}
    </div>
  )
}
```

---

## Implementation Checklist

### Public Verify Page
- [ ] Create `app/verify/[id]/page.jsx`
- [ ] Update QR links to use `/verify/` route
- [ ] Add Open Graph metadata
- [ ] Test with unauthenticated browser session
- [ ] Test QR scan from printed codes

### Fabric Production
- [ ] Update docker-compose with proper peer config
- [ ] Start peers and check logs
- [ ] Run channel creation script
- [ ] Install and approve chaincode
- [ ] Toggle `USE_REAL_BLOCKCHAIN=true`
- [ ] Run integration test
- [ ] Add blockchain transaction viewer in UI

### PWA + Webhooks
- [ ] Create `manifest.json` and icons
- [ ] Implement service worker
- [ ] Test install on mobile
- [ ] Add Webhook model to Prisma
- [ ] Build webhook management UI
- [ ] Test webhook dispatch
- [ ] Add Inspector/Auditor roles
- [ ] Build inspection dashboard

---

## Resources

### Fabric Documentation
- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [Test Network Tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html)
- [Chaincode Lifecycle](https://hyperledger-fabric.readthedocs.io/en/latest/chaincode_lifecycle.html)

### PWA Resources
- [Next.js PWA Guide](https://www.npmjs.com/package/next-pwa)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)

### Webhook Best Practices
- [Webhook Security](https://webhooks.fyi/security)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

## Support & Questions

When implementing these features:

1. **Start small**: Public verify page first (easiest, high impact)
2. **Fabric next**: Get blockchain working end-to-end
3. **Polish last**: PWA and webhooks are nice-to-haves

For help:
- Check existing code patterns in `app/api/` and `lib/`
- Review `IMPLEMENTATION_SUMMARY.md` for architecture
- Test each component in isolation before integration

Good luck! 🚀
