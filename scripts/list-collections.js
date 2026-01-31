import dotenv from 'dotenv'
dotenv.config()

import { MongoClient } from 'mongodb'

const uri = process.env.DATABASE_URL

async function listCollections() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('traceroot')
    const collections = await db.listCollections().toArray()
    
    console.log(`\n📚 Collections in 'traceroot' database (${collections.length}):\n`)
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      console.log(`  - ${collection.name} (${count} documents)`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

listCollections()
