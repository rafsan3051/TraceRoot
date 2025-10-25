import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        farmer: {
          select: {
            name: true
          }
        },
        events: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    })

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      origin: product.origin,
      registeredBy: product.farmer.name,
      status: product.events[0]?.eventType || 'Registered',
      createdAt: product.createdAt
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Failed to fetch recent products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}