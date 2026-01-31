require('dotenv').config()
const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const uri = process.env.DATABASE_URL
if (!uri) {
  console.error('ERROR: DATABASE_URL is not set. Add it to your .env file.')
  process.exit(1)
}

// Default passwords
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123'
const FARMER_PASSWORD = process.env.SEED_FARMER_PASSWORD || 'farmer123'
const DISTRIBUTOR_PASSWORD = process.env.SEED_DISTRIBUTOR_PASSWORD || 'distributor123'
const RETAILER_PASSWORD = process.env.SEED_RETAILER_PASSWORD || 'retailer123'
const CONSUMER_PASSWORD = process.env.SEED_CONSUMER_PASSWORD || 'consumer123'

async function freshSeed() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✓ Connected to MongoDB')
    
    const db = client.db('traceroot')
    
    // Get all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log('\n🗑️  Clearing all collections...')
    
    // Drop all collections
    for (const collectionName of collectionNames) {
      await db.collection(collectionName).drop()
      console.log(`   Dropped: ${collectionName}`)
    }
    
    console.log('✓ All collections cleared\n')
    
    // Create fresh collections
    const usersCollection = db.collection('User')
    const productsCollection = db.collection('Product')
    const eventsCollection = db.collection('Event')
    const pricesCollection = db.collection('Price')
    const watchlistCollection = db.collection('Watchlist')
    
    const now = new Date()
    
    // Create 5 users
    console.log('👥 Creating users...')
    
    const users = [
      {
        email: 'admin@traceroot.com',
        username: 'admin',
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        name: 'Admin User',
        role: 'ADMIN',
        verified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        email: 'farmer@traceroot.com',
        username: 'farmer',
        password: await bcrypt.hash(FARMER_PASSWORD, 12),
        name: 'Rahim Mia',
        role: 'FARMER',
        verified: true,
        address: 'Dhaka, Bangladesh',
        createdAt: now,
        updatedAt: now
      },
      {
        email: 'distributor@traceroot.com',
        username: 'distributor',
        password: await bcrypt.hash(DISTRIBUTOR_PASSWORD, 12),
        name: 'Karwan Bazar Logistics',
        role: 'DISTRIBUTOR',
        verified: true,
        address: 'Karwan Bazar, Dhaka',
        createdAt: now,
        updatedAt: now
      },
      {
        email: 'retailer@traceroot.com',
        username: 'retailer',
        password: await bcrypt.hash(RETAILER_PASSWORD, 12),
        name: 'City Market',
        role: 'RETAILER',
        verified: true,
        address: 'Gulshan, Dhaka',
        createdAt: now,
        updatedAt: now
      },
      {
        email: 'consumer@traceroot.com',
        username: 'consumer',
        password: await bcrypt.hash(CONSUMER_PASSWORD, 12),
        name: 'Karim Ahmed',
        role: 'CONSUMER',
        verified: true,
        createdAt: now,
        updatedAt: now
      }
    ]
    
    const result = await usersCollection.insertMany(users)
    console.log(`✓ Created ${result.insertedCount} users\n`)
    
    // Print credentials
    console.log('═══════════════════════════════════════════════════════')
    console.log('                    USER CREDENTIALS                    ')
    console.log('═══════════════════════════════════════════════════════\n')
    
    console.log('👑 ADMIN:')
    console.log('   Email:    admin@traceroot.com')
    console.log('   Username: admin')
    console.log(`   Password: ${ADMIN_PASSWORD}\n`)
    
    console.log('🌾 FARMER:')
    console.log('   Email:    farmer@traceroot.com')
    console.log('   Username: farmer')
    console.log(`   Password: ${FARMER_PASSWORD}\n`)
    
    console.log('🚚 DISTRIBUTOR:')
    console.log('   Email:    distributor@traceroot.com')
    console.log('   Username: distributor')
    console.log(`   Password: ${DISTRIBUTOR_PASSWORD}\n`)
    
    console.log('🏪 RETAILER:')
    console.log('   Email:    retailer@traceroot.com')
    console.log('   Username: retailer')
    console.log(`   Password: ${RETAILER_PASSWORD}\n`)
    
    console.log('🛒 CONSUMER:')
    console.log('   Email:    consumer@traceroot.com')
    console.log('   Username: consumer')
    console.log(`   Password: ${CONSUMER_PASSWORD}\n`)
    
    console.log('═══════════════════════════════════════════════════════')
    console.log('\n✅ Database reset complete! Ready for fresh start.')
    console.log('\n📝 Note: No products or events created.')
    console.log('   Users can now register new products from the app.\n')
    
  } catch (error) {
    console.error('❌ Error during fresh seed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

freshSeed()
