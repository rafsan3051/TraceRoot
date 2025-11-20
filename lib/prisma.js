// MongoDB connection and models
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.DATABASE_URL
const options = {}

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve connection across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Helper to get database
export async function getDb() {
  const client = await clientPromise
  return client.db('traceroot')
}

// Helper to get collections
export async function getCollection(name) {
  const db = await getDb()
  return db.collection(name)
}

// Export ObjectId for convenience
export { ObjectId }

// Export prisma-like models
export { default } from './db/models.js'