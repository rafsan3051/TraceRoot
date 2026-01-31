// MongoDB connection and models
import dotenv from 'dotenv'
dotenv.config()

import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.DATABASE_URL
const options = {}

let client
let clientPromise
let useMemoryDb = false
const memoryCollections = new Map()

function getMemoryCollection(name) {
  if (!memoryCollections.has(name)) {
    memoryCollections.set(name, [])
  }

  const store = memoryCollections.get(name)

  return {
    async findOne(query = {}) {
      return store.find((doc) =>
        Object.entries(query).every(([k, v]) => String(doc[k]) === String(v))
      ) || null
    },
    find(query = {}) {
      const result = store.filter((doc) =>
        Object.entries(query).every(([k, v]) => String(doc[k]) === String(v))
      )
      return {
        sort: () => ({ toArray: async () => result }),
        skip: () => ({ toArray: async () => result }),
        limit: () => ({ toArray: async () => result }),
        toArray: async () => result,
      }
    },
    async insertOne(doc) {
      const _id = new ObjectId()
      store.push({ _id, ...doc })
      return { insertedId: _id }
    },
    async findOneAndUpdate(query, update) {
      const doc = await this.findOne(query)
      if (!doc) return { value: null }
      Object.assign(doc, update.$set || {})
      return { value: doc }
    },
    async findOneAndDelete(query) {
      const idx = store.findIndex((doc) =>
        Object.entries(query).every(([k, v]) => String(doc[k]) === String(v))
      )
      if (idx === -1) return { value: null }
      const [removed] = store.splice(idx, 1)
      return { value: removed }
    },
    async deleteMany(query = {}) {
      const before = store.length
      for (let i = store.length - 1; i >= 0; i--) {
        const doc = store[i]
        const match = Object.entries(query).every(([k, v]) => String(doc[k]) === String(v))
        if (match) store.splice(i, 1)
      }
      return { deletedCount: before - store.length }
    },
  }
}

function enableMemoryDb(reason) {
  if (useMemoryDb) return
  useMemoryDb = true
  console.warn('⚠️ Using in-memory database fallback:', reason)
}

if (!uri) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('Please configure DATABASE_URL in your Vercel project settings.')
  console.error('See VERCEL_DEPLOYMENT.md for instructions.')
  enableMemoryDb('DATABASE_URL missing')
} else {
  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect().catch((err) => {
          enableMemoryDb(err.message)
          return null
        })
      }
      clientPromise = global._mongoClientPromise
    } else {
      client = new MongoClient(uri, options)
      clientPromise = client.connect().catch((err) => {
        enableMemoryDb(err.message)
        return null
      })
    }
  } catch (err) {
    enableMemoryDb(err.message)
  }
}

// Helper to get database
export async function getDb() {
  if (useMemoryDb) {
    return {
      collection: getMemoryCollection,
    }
  }

  const client = await clientPromise
  if (!client) {
    enableMemoryDb('Mongo client unavailable')
    return { collection: getMemoryCollection }
  }
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