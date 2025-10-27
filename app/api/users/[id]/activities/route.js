import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const resolvedParams = await params
    
    // Verify auth via cookie-based session
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow viewing own activities unless admin
    if (session.role !== 'ADMIN' && session.id !== resolvedParams.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get activities based on role
    let activities = {}

    switch (user.role) {
      case 'FARMER':
        activities = {
          products: await prisma.product.findMany({
            where: { farmerId: resolvedParams.id },
            orderBy: { createdAt: 'desc' },
          }).then(products => products.map(p => ({
            ...p,
            price: p.price ? Number(p.price) : 0
          }))),
          events: await prisma.supplyChainEvent.findMany({
            where: {
              product: {
                farmerId: resolvedParams.id
              }
            },
            orderBy: { timestamp: 'desc' },
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          })
        }
        break

      case 'DISTRIBUTOR':
        activities.events = await prisma.supplyChainEvent.findMany({
          where: {
            OR: [
              { eventType: 'PICKED_UP', userId: resolvedParams.id },
              { eventType: 'IN_TRANSIT', userId: resolvedParams.id },
              { eventType: 'DELIVERED', userId: resolvedParams.id }
            ]
          },
          orderBy: { timestamp: 'desc' },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        })
        break

      case 'RETAILER':
        activities.events = await prisma.supplyChainEvent.findMany({
          where: {
            OR: [
              { eventType: 'RECEIVED', userId: resolvedParams.id },
              { eventType: 'IN_STOCK', userId: resolvedParams.id },
              { eventType: 'SOLD', userId: resolvedParams.id }
            ]
          },
          orderBy: { timestamp: 'desc' },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        })
        break

      case 'CONSUMER':
        activities.events = await prisma.supplyChainEvent.findMany({
          where: {
            eventType: 'PURCHASED',
            userId: resolvedParams.id
          },
          orderBy: { timestamp: 'desc' },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        })
        break
    }

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch user activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}