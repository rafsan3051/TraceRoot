require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

const uri = process.env.DATABASE_URL
if (!uri) {
  console.error('ERROR: DATABASE_URL is not set. Add it to your .env file.')
  process.exit(1)
}

// Load passwords from environment variables with fallback defaults (for development only)
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123'
const FARMER_PASSWORD = process.env.SEED_FARMER_PASSWORD || 'farmer123'
const DISTRIBUTOR_PASSWORD = process.env.SEED_DISTRIBUTOR_PASSWORD || 'dist123'
const RETAILER_PASSWORD = process.env.SEED_RETAILER_PASSWORD || 'retail123'
const CONSUMER_PASSWORD = process.env.SEED_CONSUMER_PASSWORD || 'consumer123'

// Helper to upsert user
async function upsertUser(usersCollection, email, username, data) {
  const existing = await usersCollection.findOne({ email })
  const now = new Date()
  
  if (existing) {
    await usersCollection.updateOne(
      { email },
      { $set: { username, updatedAt: now } }
    )
    return { _id: existing._id, email, ...data, ...existing }
  } else {
    const result = await usersCollection.insertOne({
      ...data,
      email,
      username,
      createdAt: now,
      updatedAt: now
    })
    return { _id: result.insertedId, email, username, ...data }
  }
}

async function seed() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('traceroot')
    const usersCollection = db.collection('users')
    const productsCollection = db.collection('products')
    const eventsCollection = db.collection('supply_chain_events')

    const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const admin = await upsertUser(usersCollection, 'admin@traceroot.com', 'admin', {
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      verified: true,
    })

    console.log('Admin user created:', admin.email)

    // Create some farmers
    const farmers = await Promise.all([
      upsertUser(usersCollection, 'farmer1@example.com', 'farmer1', {
        password: await bcrypt.hash(FARMER_PASSWORD, 12),
        name: 'John Smith',
        role: 'FARMER',
        verified: true,
      }),
      upsertUser(usersCollection, 'farmer2@example.com', 'farmer2', {
        password: await bcrypt.hash(FARMER_PASSWORD, 12),
        name: 'Mary Johnson',
        role: 'FARMER',
        verified: true,
      })
    ])

    console.log('Farmers created:', farmers.map(f => f.email))

    // Create some distributors
    const distributors = await Promise.all([
      upsertUser(usersCollection, 'dist1@example.com', 'dist1', {
        password: await bcrypt.hash(DISTRIBUTOR_PASSWORD, 12),
        name: 'ABC Distribution',
        role: 'DISTRIBUTOR',
        verified: true,
        address: '123 Logistics Park'
      }),
      upsertUser(usersCollection, 'dist2@example.com', 'dist2', {
        password: await bcrypt.hash(DISTRIBUTOR_PASSWORD, 12),
        name: 'XYZ Logistics',
        role: 'DISTRIBUTOR',
        verified: false,
        address: '456 Transport Hub'
      }),
      upsertUser(usersCollection, 'dist3@example.com', 'dist3', {
        password: await bcrypt.hash(DISTRIBUTOR_PASSWORD, 12),
        name: 'FastTrack Logistics',
        role: 'DISTRIBUTOR',
        verified: true,
        address: '789 Shipping Lane'
      }),
      upsertUser(usersCollection, 'dist4@example.com', 'dist4', {
        password: await bcrypt.hash(DISTRIBUTOR_PASSWORD, 12),
        name: 'Global Supply Chain',
        role: 'DISTRIBUTOR',
        verified: true,
        address: '101 Distribution Center'
      })
    ])

    console.log('Distributors created:', distributors.map(d => d.email))

    // Create some retailers
    const retailers = await Promise.all([
      upsertUser(usersCollection, 'retail1@example.com', 'retail1', {
        password: await bcrypt.hash(RETAILER_PASSWORD, 12),
        name: 'City Grocers',
        role: 'RETAILER',
        verified: true,
        address: '123 Market Street, City Center'
      }),
      upsertUser(usersCollection, 'retail2@example.com', 'retail2', {
        password: await bcrypt.hash(RETAILER_PASSWORD, 12),
        name: 'Fresh Foods Market',
        role: 'RETAILER',
        verified: true,
        address: '456 Main Road, Shopping District'
      }),
      upsertUser(usersCollection, 'retail3@example.com', 'retail3', {
        password: await bcrypt.hash(RETAILER_PASSWORD, 12),
        name: 'Organic Store',
        role: 'RETAILER',
        verified: true,
        address: '789 Green Street, Eco District'
      }),
      upsertUser(usersCollection, 'retail4@example.com', 'retail4', {
        password: await bcrypt.hash(RETAILER_PASSWORD, 12),
        name: 'Village Market',
        role: 'RETAILER',
        verified: false,
        address: '321 Rural Road, Village Area'
      })
    ])

    console.log('Retailers created:', retailers.map(r => r.email))

    // Create some consumers
    const consumers = await Promise.all([
      upsertUser(usersCollection, 'consumer1@example.com', 'consumer1', {
        password: await bcrypt.hash(CONSUMER_PASSWORD, 12),
        name: 'Consumer One',
        role: 'CONSUMER',
        verified: true
      }),
      upsertUser(usersCollection, 'consumer2@example.com', 'consumer2', {
        password: await bcrypt.hash(CONSUMER_PASSWORD, 12),
        name: 'Consumer Two',
        role: 'CONSUMER',
        verified: true
      })
    ])

    console.log('Consumers created:', consumers.map(c => c.email))

    // Create some products
    const now = new Date()
    
    const product1 = {
      name: 'Premium Basmati Rice',
      origin: 'Punjab Region',
      manufactureDate: now,
      qrCodeUrl: 'https://traceroot.com/p/1',
      blockchainTxId: '0x123...abc',
      farmerId: farmers[0]._id,
      price: 120.00,
      category: 'Rice',
      description: 'High-quality basmati rice from Punjab',
      createdAt: now,
      updatedAt: now
    }
    
    const product2 = {
      name: 'Organic Brown Rice',
      origin: 'Karnataka Region',
      manufactureDate: now,
      qrCodeUrl: 'https://traceroot.com/p/2',
      blockchainTxId: '0x234...bcd',
      farmerId: farmers[1]._id,
      price: 95.50,
      category: 'Rice',
      description: 'Organic brown rice from Karnataka',
      createdAt: now,
      updatedAt: now
    }
    
    const result1 = await productsCollection.insertOne(product1)
    const result2 = await productsCollection.insertOne(product2)
    
    // Create events for products
    await eventsCollection.insertMany([
      {
        productId: result1.insertedId,
        eventType: 'HARVESTED',
        location: 'Punjab Farm #123',
        timestamp: now,
        blockchainTxId: '0x456...def'
      },
      {
        productId: result1.insertedId,
        eventType: 'PROCESSED',
        location: 'Rice Mill #456',
        timestamp: new Date(Date.now() + 86400000),
        blockchainTxId: '0x789...ghi'
      },
      {
        productId: result2.insertedId,
        eventType: 'HARVESTED',
        location: 'Karnataka Farm #789',
        timestamp: now,
        blockchainTxId: '0x567...efg'
      }
    ])

    const products = [
      { name: product1.name },
      { name: product2.name }
    ]

    console.log('Products created:', products.map(p => p.name))

    console.log('\nSeeding completed successfully!')
    console.log('\nAdmin Credentials:')
    console.log('Email: admin@traceroot.com')
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log('\nFarmer Credentials:')
    console.log('Email: farmer1@example.com')
    console.log(`Password: ${FARMER_PASSWORD}`)
    console.log('\nDistributor Credentials:')
    console.log('Email: dist1@example.com')
    console.log(`Password: ${DISTRIBUTOR_PASSWORD}`)
    console.log('\nRetailer Credentials:')
    console.log('Email: retail1@example.com | Username: retail1')
    console.log(`Password: ${RETAILER_PASSWORD}`)
    console.log('\nConsumer Credentials:')
    console.log('Email: consumer1@example.com')
    console.log(`Password: ${CONSUMER_PASSWORD}`)  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()