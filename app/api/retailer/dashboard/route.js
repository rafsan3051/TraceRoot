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

    if (!user || user.role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Retailer access required' },
        { status: 403 }
      )
    }

    // For demo purposes, returning mock data
    // In a real app, this would query actual transactions and inventory
    return NextResponse.json({
      availableProducts: 150,
      totalSales: 45000,
      activeOrders: 12,
      recentTransactions: [
        {
          id: 1,
          productName: 'Premium Basmati Rice',
          quantity: 100,
          price: 12000,
          date: new Date(),
          status: 'completed'
        },
        {
          id: 2,
          productName: 'Organic Brown Rice',
          quantity: 50,
          price: 4750,
          date: new Date(Date.now() - 86400000),
          status: 'pending'
        },
        {
          id: 3,
          productName: 'Premium Basmati Rice',
          quantity: 75,
          price: 9000,
          date: new Date(Date.now() - 172800000),
          status: 'completed'
        }
      ]
    })
  } catch (error) {
    console.error('Retailer dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}