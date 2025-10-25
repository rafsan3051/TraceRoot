const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@traceroot.com' },
      update: {},
      create: {
        email: 'admin@traceroot.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        verified: true,
      },
    })

    console.log('Admin user created:', admin.email)

    // Create some farmers
    const farmers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'farmer1@example.com' },
        update: {},
        create: {
          email: 'farmer1@example.com',
          password: await bcrypt.hash('farmer123', 12),
          name: 'John Smith',
          role: 'FARMER',
          verified: true,
        }
      }),
      prisma.user.upsert({
        where: { email: 'farmer2@example.com' },
        update: {},
        create: {
          email: 'farmer2@example.com',
          password: await bcrypt.hash('farmer123', 12),
          name: 'Mary Johnson',
          role: 'FARMER',
          verified: true,
        }
      })
    ])

    console.log('Farmers created:', farmers.map(f => f.email))

    // Create some distributors
    const distributors = await Promise.all([
      prisma.user.upsert({
        where: { email: 'dist1@example.com' },
        update: {},
        create: {
          email: 'dist1@example.com',
          password: await bcrypt.hash('dist123', 12),
          name: 'ABC Distribution',
          role: 'DISTRIBUTOR',
          verified: true,
          address: '123 Logistics Park'
        }
      }),
      prisma.user.upsert({
        where: { email: 'dist2@example.com' },
        update: {},
        create: {
          email: 'dist2@example.com',
          password: await bcrypt.hash('dist123', 12),
          name: 'XYZ Logistics',
          role: 'DISTRIBUTOR',
          verified: false,
          address: '456 Transport Hub'
        }
      }),
      prisma.user.upsert({
        where: { email: 'dist3@example.com' },
        update: {},
        create: {
          email: 'dist3@example.com',
          password: await bcrypt.hash('dist123', 12),
          name: 'FastTrack Logistics',
          role: 'DISTRIBUTOR',
          verified: true,
          address: '789 Shipping Lane'
        }
      }),
      prisma.user.upsert({
        where: { email: 'dist4@example.com' },
        update: {},
        create: {
          email: 'dist4@example.com',
          password: await bcrypt.hash('dist123', 12),
          name: 'Global Supply Chain',
          role: 'DISTRIBUTOR',
          verified: true,
          address: '101 Distribution Center'
        }
      })
    ])

    console.log('Distributors created:', distributors.map(d => d.email))

    // Create some retailers
    const retailers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'retail1@example.com' },
        update: {},
        create: {
          email: 'retail1@example.com',
          password: await bcrypt.hash('retail123', 12),
          name: 'City Grocers',
          role: 'RETAILER',
          verified: true,
          address: '123 Market Street, City Center'
        }
      }),
      prisma.user.upsert({
        where: { email: 'retail2@example.com' },
        update: {},
        create: {
          email: 'retail2@example.com',
          password: await bcrypt.hash('retail123', 12),
          name: 'Fresh Foods Market',
          role: 'RETAILER',
          verified: true,
          address: '456 Main Road, Shopping District'
        }
      }),
      prisma.user.upsert({
        where: { email: 'retail3@example.com' },
        update: {},
        create: {
          email: 'retail3@example.com',
          password: await bcrypt.hash('retail123', 12),
          name: 'Organic Store',
          role: 'RETAILER',
          verified: true,
          address: '789 Green Street, Eco District'
        }
      }),
      prisma.user.upsert({
        where: { email: 'retail4@example.com' },
        update: {},
        create: {
          email: 'retail4@example.com',
          password: await bcrypt.hash('retail123', 12),
          name: 'Village Market',
          role: 'RETAILER',
          verified: false,
          address: '321 Rural Road, Village Area'
        }
      })
    ])

    console.log('Retailers created:', retailers.map(r => r.email))

    // Create some products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Premium Basmati Rice',
          origin: 'Punjab Region',
          manufactureDate: new Date(),
          qrCodeUrl: 'https://traceroot.com/p/1',
          blockchainTxId: '0x123...abc',
          farmerId: farmers[0].id,
          price: 120.00,
          category: 'Rice',
          description: 'High-quality basmati rice from Punjab',
          events: {
            create: [
              {
                eventType: 'HARVESTED',
                location: 'Punjab Farm #123',
                timestamp: new Date(),
                blockchainTxId: '0x456...def'
              },
              {
                eventType: 'PROCESSED',
                location: 'Rice Mill #456',
                timestamp: new Date(Date.now() + 86400000),
                blockchainTxId: '0x789...ghi'
              }
            ]
          }
        }
      }),
      prisma.product.create({
        data: {
          name: 'Organic Brown Rice',
          origin: 'Karnataka Region',
          manufactureDate: new Date(),
          qrCodeUrl: 'https://traceroot.com/p/2',
          blockchainTxId: '0x234...bcd',
          farmerId: farmers[1].id,
          price: 95.50,
          category: 'Rice',
          description: 'Organic brown rice from Karnataka',
          events: {
            create: [
              {
                eventType: 'HARVESTED',
                location: 'Karnataka Farm #789',
                timestamp: new Date(),
                blockchainTxId: '0x567...efg'
              }
            ]
          }
        }
      })
    ])

    console.log('Products created:', products.map(p => p.name))

    console.log('\nSeeding completed successfully!')
    console.log('\nAdmin Credentials:')
    console.log('Email: admin@traceroot.com')
    console.log('Password: admin123')
    console.log('\nFarmer Credentials:')
    console.log('Email: farmer1@example.com')
    console.log('Password: farmer123')
    console.log('\nDistributor Credentials:')
    console.log('Email: dist1@example.com')
    console.log('Password: dist123')

  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()