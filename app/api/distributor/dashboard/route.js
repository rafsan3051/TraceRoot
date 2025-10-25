import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    })

    if (!user || user.role !== 'DISTRIBUTOR') {
      return NextResponse.json(
        { error: 'Distributor access required' },
        { status: 403 }
      )
    }

    // TODO: Replace with actual shipment data once model is added
    // For now, returning mock data
    return NextResponse.json({
      activeShipments: 15,
      totalProducts: 250,
      deliveryRoutes: 8,
      completedDeliveries: 128,
      recentShipments: [
        {
          id: 1,
          trackingId: 'SHIP001',
          productName: 'Premium Basmati Rice',
          origin: 'Punjab Farm #123',
          destination: 'City Grocers',
          status: 'in-transit'
        },
        {
          id: 2,
          trackingId: 'SHIP002',
          productName: 'Organic Brown Rice',
          origin: 'Karnataka Farm #789',
          destination: 'Fresh Foods Market',
          status: 'delivered'
        },
        {
          id: 3,
          trackingId: 'SHIP003',
          productName: 'Premium Basmati Rice',
          origin: 'Punjab Farm #123',
          destination: 'Organic Store',
          status: 'pending'
        }
      ],
      routes: [
        {
          id: 1,
          name: 'North City Route',
          stops: 5,
          status: 'active',
          driver: 'John Smith',
          vehicle: 'Truck 101',
          eta: '2 hours'
        },
        {
          id: 2,
          name: 'South City Route',
          stops: 3,
          status: 'scheduled',
          driver: 'Mary Johnson',
          vehicle: 'Truck 102',
          eta: '4 hours'
        }
      ]
    })
  } catch (error) {
    console.error('Distributor dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}