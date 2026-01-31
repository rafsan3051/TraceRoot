import dotenv from 'dotenv'
dotenv.config()

import prisma from '../lib/prisma.js'

async function testPrismaConnection() {
  try {
    console.log('Testing Prisma connection...')
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 40) + '...')
    
    // Try to find a user
    const user = await prisma.user.findUnique({
      where: { email: 'farmer@traceroot.com' }
    })
    
    if (user) {
      console.log('✅ User found:')
      console.log('   Email:', user.email)
      console.log('   Role:', user.role)
      console.log('   Password hash:', user.password?.substring(0, 20) + '...')
    } else {
      console.log('❌ User not found')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testPrismaConnection()
