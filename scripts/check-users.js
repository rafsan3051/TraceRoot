import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.DATABASE_URL

async function checkUsers() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('traceroot')
    const usersCollection = db.collection('User')

    const users = await usersCollection.find({}).toArray()
    console.log(`\n📊 Found ${users.length} users in database:\n`)

    for (const user of users) {
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
      console.log(`Verified: ${user.verified}`)
      console.log(`Password hash: ${user.password?.substring(0, 20)}...`)
      
      // Test password verification with lowercase role
      const testPassword = user.role.toLowerCase() + '123'
      const match = await bcrypt.compare(testPassword, user.password)
      console.log(`Password '${testPassword}' matches: ${match ? '✅' : '❌'}`)
      console.log('---')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
    console.log('\n✅ Connection closed')
  }
}

checkUsers()
