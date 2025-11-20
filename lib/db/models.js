// MongoDB Models Helper - Prisma-like API wrapper for MongoDB native driver
import { getCollection, ObjectId } from './prisma.js'

// Helper to convert MongoDB _id to id for consistency
function formatDocument(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

function formatDocuments(docs) {
  return docs.map(formatDocument)
}

// Helper to parse ObjectId if needed
function parseId(id) {
  if (!id) return null
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    return new ObjectId(id)
  }
  return id
}

// User Model
export const User = {
  async findUnique({ where }) {
    const collection = await getCollection('users')
    const query = {}
    
    if (where.id) query._id = parseId(where.id)
    if (where.email) query.email = where.email
    if (where.username) query.username = where.username
    
    const doc = await collection.findOne(query)
    return formatDocument(doc)
  },

  async findFirst({ where }) {
    const collection = await getCollection('users')
    const doc = await collection.findOne(where)
    return formatDocument(doc)
  },

  async findMany({ where = {}, orderBy, take, skip } = {}) {
    const collection = await getCollection('users')
    let cursor = collection.find(where)
    
    if (orderBy) {
      const sort = {}
      for (const [key, value] of Object.entries(orderBy)) {
        sort[key] = value === 'asc' ? 1 : -1
      }
      cursor = cursor.sort(sort)
    }
    
    if (skip) cursor = cursor.skip(skip)
    if (take) cursor = cursor.limit(take)
    
    const docs = await cursor.toArray()
    return formatDocuments(docs)
  },

  async create({ data }) {
    const collection = await getCollection('users')
    const now = new Date()
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now
    }
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  },

  async update({ where, data }) {
    const collection = await getCollection('users')
    const query = where.id ? { _id: parseId(where.id) } : where
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return formatDocument(result)
  },

  async delete({ where }) {
    const collection = await getCollection('users')
    const query = where.id ? { _id: parseId(where.id) } : where
    const result = await collection.findOneAndDelete(query)
    return formatDocument(result)
  }
}

// Product Model
export const Product = {
  async findUnique({ where, include }) {
    const collection = await getCollection('products')
    const query = where.id ? { _id: parseId(where.id) } : where
    const doc = await collection.findOne(query)
    
    if (!doc || !include) return formatDocument(doc)
    
    // Handle includes if needed
    const formatted = formatDocument(doc)
    if (include.farmer) {
      formatted.farmer = await User.findUnique({ where: { id: doc.farmerId } })
    }
    if (include.events) {
      formatted.events = await SupplyChainEvent.findMany({ where: { productId: formatted.id } })
    }
    return formatted
  },

  async findMany({ where = {}, orderBy, take, skip, include } = {}) {
    const collection = await getCollection('products')
    
    // Convert farmerId if present
    if (where.farmerId) {
      where.farmerId = parseId(where.farmerId)
    }
    
    let cursor = collection.find(where)
    
    if (orderBy) {
      const sort = {}
      for (const [key, value] of Object.entries(orderBy)) {
        sort[key] = value === 'asc' ? 1 : -1
      }
      cursor = cursor.sort(sort)
    }
    
    if (skip) cursor = cursor.skip(skip)
    if (take) cursor = cursor.limit(take)
    
    const docs = await cursor.toArray()
    return formatDocuments(docs)
  },

  async create({ data }) {
    const collection = await getCollection('products')
    const now = new Date()
    
    // Convert farmerId to ObjectId
    const doc = {
      ...data,
      farmerId: parseId(data.farmerId),
      manufactureDate: new Date(data.manufactureDate),
      createdAt: now,
      updatedAt: now
    }
    
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  },

  async update({ where, data }) {
    const collection = await getCollection('products')
    const query = where.id ? { _id: parseId(where.id) } : where
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    }
    
    if (updateData.farmerId) {
      updateData.farmerId = parseId(updateData.farmerId)
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return formatDocument(result)
  },

  async delete({ where }) {
    const collection = await getCollection('products')
    const query = where.id ? { _id: parseId(where.id) } : where
    const result = await collection.findOneAndDelete(query)
    return formatDocument(result)
  }
}

// SupplyChainEvent Model
export const SupplyChainEvent = {
  async findUnique({ where, include }) {
    const collection = await getCollection('supply_chain_events')
    const query = where.id ? { _id: parseId(where.id) } : where
    const doc = await collection.findOne(query)
    return formatDocument(doc)
  },

  async findMany({ where = {}, orderBy, take, skip, include } = {}) {
    const collection = await getCollection('supply_chain_events')
    
    // Convert productId if present
    if (where.productId) {
      where.productId = parseId(where.productId)
    }
    
    let cursor = collection.find(where)
    
    if (orderBy) {
      const sort = {}
      for (const [key, value] of Object.entries(orderBy)) {
        sort[key] = value === 'asc' ? 1 : -1
      }
      cursor = cursor.sort(sort)
    }
    
    if (skip) cursor = cursor.skip(skip)
    if (take) cursor = cursor.limit(take)
    
    const docs = await cursor.toArray()
    return formatDocuments(docs)
  },

  async create({ data }) {
    const collection = await getCollection('supply_chain_events')
    const now = new Date()
    
    const doc = {
      ...data,
      productId: parseId(data.productId),
      timestamp: data.timestamp || now,
    }
    
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  },

  async update({ where, data }) {
    const collection = await getCollection('supply_chain_events')
    const query = where.id ? { _id: parseId(where.id) } : where
    
    if (data.productId) {
      data.productId = parseId(data.productId)
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: 'after' }
    )
    return formatDocument(result)
  }
}

// PasswordResetToken Model
export const PasswordResetToken = {
  async findUnique({ where }) {
    const collection = await getCollection('password_reset_tokens')
    const query = {}
    
    if (where.id) query._id = parseId(where.id)
    if (where.token) query.token = where.token
    
    const doc = await collection.findOne(query)
    return formatDocument(doc)
  },

  async create({ data }) {
    const collection = await getCollection('password_reset_tokens')
    const now = new Date()
    
    const doc = {
      ...data,
      userId: parseId(data.userId),
      expiresAt: new Date(data.expiresAt),
      createdAt: now
    }
    
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  },

  async deleteMany({ where }) {
    const collection = await getCollection('password_reset_tokens')
    const query = {}
    
    if (where.userId) {
      query.userId = parseId(where.userId)
    }
    
    await collection.deleteMany(query)
  }
}

// ProductWatch Model
export const ProductWatch = {
  async findMany({ where = {}, include } = {}) {
    const collection = await getCollection('product_watches')
    
    if (where.userId) {
      where.userId = parseId(where.userId)
    }
    if (where.productId) {
      where.productId = parseId(where.productId)
    }
    
    const docs = await collection.find(where).toArray()
    const formatted = formatDocuments(docs)
    
    if (include) {
      for (const watch of formatted) {
        if (include.product) {
          watch.product = await Product.findUnique({ where: { id: watch.productId } })
        }
        if (include.user) {
          watch.user = await User.findUnique({ where: { id: watch.userId } })
        }
      }
    }
    
    return formatted
  },

  async upsert({ where, create, update }) {
    const collection = await getCollection('product_watches')
    const now = new Date()
    
    const query = {}
    if (where.userId) query.userId = parseId(where.userId)
    if (where.productId) query.productId = parseId(where.productId)
    if (where.userId_productId) {
      query.userId = parseId(where.userId_productId.userId)
      query.productId = parseId(where.userId_productId.productId)
    }
    
    const createData = {
      ...create,
      userId: parseId(create.userId),
      productId: parseId(create.productId),
      createdAt: now
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      { $set: createData },
      { upsert: true, returnDocument: 'after' }
    )
    
    return formatDocument(result)
  },

  async deleteMany({ where }) {
    const collection = await getCollection('product_watches')
    
    const query = {}
    if (where.userId) query.userId = parseId(where.userId)
    if (where.productId) query.productId = parseId(where.productId)
    
    await collection.deleteMany(query)
  }
}

// AuditLog Model
export const AuditLog = {
  async create({ data }) {
    const collection = await getCollection('audit_logs')
    const now = new Date()
    
    const doc = {
      ...data,
      userId: data.userId ? parseId(data.userId) : null,
      timestamp: now
    }
    
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  },

  async findMany({ where = {}, orderBy, take, skip } = {}) {
    const collection = await getCollection('audit_logs')
    
    if (where.userId) {
      where.userId = parseId(where.userId)
    }
    
    let cursor = collection.find(where)
    
    if (orderBy) {
      const sort = {}
      for (const [key, value] of Object.entries(orderBy)) {
        sort[key] = value === 'asc' ? 1 : -1
      }
      cursor = cursor.sort(sort)
    }
    
    if (skip) cursor = cursor.skip(skip)
    if (take) cursor = cursor.limit(take)
    
    const docs = await cursor.toArray()
    return formatDocuments(docs)
  }
}

// EventAttachment Model
export const EventAttachment = {
  async findMany({ where = {} } = {}) {
    const collection = await getCollection('event_attachments')
    
    if (where.eventId) {
      where.eventId = parseId(where.eventId)
    }
    
    const docs = await collection.find(where).toArray()
    return formatDocuments(docs)
  },

  async create({ data }) {
    const collection = await getCollection('event_attachments')
    const now = new Date()
    
    const doc = {
      ...data,
      eventId: parseId(data.eventId),
      uploadedAt: now
    }
    
    const result = await collection.insertOne(doc)
    return formatDocument({ _id: result.insertedId, ...doc })
  }
}

// Export a prisma-like object
const prisma = {
  user: User,
  product: Product,
  supplyChainEvent: SupplyChainEvent,
  passwordResetToken: PasswordResetToken,
  productWatch: ProductWatch,
  auditLog: AuditLog,
  eventAttachment: EventAttachment
}

export default prisma
