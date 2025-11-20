# TraceRoot Setup Guide

## Database Migration Complete ✅

The project has been successfully migrated from MySQL + Prisma to **MongoDB with native driver**.

## What Changed

### Removed:
- ✅ Prisma Client (`@prisma/client`)
- ✅ Prisma CLI (`prisma`)
- ✅ Prisma schema files (`prisma/schema.prisma`)
- ✅ Unnecessary documentation files
- ✅ All MySQL-specific code

### Added:
- ✅ MongoDB native driver (`mongodb`)
- ✅ MongoDB connection utility (`lib/prisma.js`)
- ✅ Prisma-like models wrapper (`lib/db/models.js`)
- ✅ Updated seed script for MongoDB

### Updated:
- ✅ All API routes now use MongoDB native queries
- ✅ Environment configuration for MongoDB Atlas
- ✅ Seed script updated for MongoDB

## Setup Instructions

### 1. Configure Database Connection

Open `.env` file and replace `<db_password>` with your actual MongoDB password:

```env
DATABASE_URL="mongodb+srv://admin:YOUR_PASSWORD_HERE@trace-root.ekqdb51.mongodb.net/traceroot?retryWrites=true&w=majority&appName=Trace-Root"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- Admin user
- Sample farmers, distributors, retailers, consumers
- Sample products with supply chain events

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Default Login Credentials

After seeding, you can login with:

**Admin:**
- Email: `admin@traceroot.com`
- Username: `admin`
- Password: `admin123` (or value from `SEED_ADMIN_PASSWORD` in .env)

**Farmer:**
- Email: `farmer1@example.com`
- Username: `farmer1`
- Password: `farmer123`

**Distributor:**
- Email: `dist1@example.com`
- Username: `dist1`
- Password: `dist123`

**Retailer:**
- Email: `retail1@example.com`
- Username: `retail1`
- Password: `retail123`

**Consumer:**
- Email: `consumer1@example.com`
- Username: `consumer1`
- Password: `consumer123`

## MongoDB Collections

The following collections are used:

- `users` - All user accounts (farmers, distributors, retailers, consumers, admin)
- `products` - Product registry
- `supply_chain_events` - Supply chain event tracking
- `password_reset_tokens` - Password reset tokens
- `product_watches` - Product watchlist/notifications
- `audit_logs` - System audit logs
- `event_attachments` - File attachments for events

## Code Structure

### Database Layer

**`lib/prisma.js`** - MongoDB connection manager
- Handles connection pooling
- Exports connection helpers

**`lib/db/models.js`** - Prisma-like API wrapper
- Provides familiar API similar to Prisma
- Wraps MongoDB native driver
- Handles ObjectId conversions
- Exports model objects: `User`, `Product`, `SupplyChainEvent`, etc.

### Usage Example

```javascript
import prisma from '@/lib/prisma'

// Find user by email
const user = await prisma.user.findUnique({ 
  where: { email: 'admin@traceroot.com' } 
})

// Create product
const product = await prisma.product.create({
  data: {
    name: 'Rice',
    origin: 'Punjab',
    farmerId: userId,
    price: 100,
    // ...
  }
})

// Find products with filtering
const products = await prisma.product.findMany({
  where: { farmerId: userId },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

## MongoDB Native Driver Access

If you need direct MongoDB access:

```javascript
import { getDb, getCollection, ObjectId } from '@/lib/prisma'

// Get database
const db = await getDb()

// Get specific collection
const users = await getCollection('users')

// Use native MongoDB methods
const user = await users.findOne({ email: 'test@example.com' })

// ObjectId helper
const userId = new ObjectId('507f1f77bcf86cd799439011')
```

## Differences from Prisma

### ID Fields
- MongoDB uses `_id` internally (mapped to `id` in our wrapper)
- IDs are ObjectIds, not UUIDs
- When querying, IDs are automatically converted

### Data Types
- `Decimal` → `Float` (for prices)
- `Text` → `String` (MongoDB handles large text automatically)
- Dates are native Date objects

### Relations
- No automatic joins (need manual population)
- Foreign keys are ObjectId references
- Use `include` option for basic relations (implemented in wrapper)

## Troubleshooting

### Connection Issues

**Problem:** Can't connect to MongoDB
**Solution:**
1. Check your password in `.env`
2. Verify IP whitelist in MongoDB Atlas (add your IP or use 0.0.0.0/0 for testing)
3. Check network connectivity

### Seed Script Fails

**Problem:** Seeding throws errors
**Solution:**
1. Ensure DATABASE_URL is correct
2. Check MongoDB Atlas cluster is running
3. Verify database name is `traceroot` in connection string

### Application Crashes

**Problem:** App crashes with database errors
**Solution:**
1. Check all environment variables are set
2. Verify MongoDB connection string format
3. Check server logs for specific errors

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL="mongodb+srv://..."
NODE_ENV="production"
JWT_SECRET="your-secure-secret"
QR_SIGNING_SECRET="your-qr-secret"
# ... other secrets
```

### MongoDB Atlas Setup

1. Create production cluster
2. Enable authentication
3. Whitelist production server IP
4. Enable connection pooling
5. Set up monitoring and alerts

### Security

- Use strong passwords
- Enable network access controls
- Regular backups
- Monitor for unusual activity
- Use SSL/TLS connections (enabled by default in connection string)

## Additional Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Run seed script
npm run seed

# Blockchain scripts (if enabled)
npm run fabric:network:start
npm run fabric:chaincode:deploy
```

## Support

For issues:
1. Check MongoDB Atlas dashboard
2. Review application logs
3. Verify all environment variables
4. Test database connection independently
