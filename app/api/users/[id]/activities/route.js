import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'

export async function GET(request, { params }) {
  try {
    // Verify auth via cookie-based session
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow viewing own activities unless admin
    if (session.role !== 'ADMIN' && session.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
            where: { farmerId: params.id },
            orderBy: { createdAt: 'desc' },
          }),
          events: await prisma.supplyChainEvent.findMany({
            where: {
              product: {
                farmerId: params.id
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
              { eventType: 'PICKED_UP', userId: params.id },
              { eventType: 'IN_TRANSIT', userId: params.id },
              { eventType: 'DELIVERED', userId: params.id }
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
              { eventType: 'RECEIVED', userId: params.id },
              { eventType: 'IN_STOCK', userId: params.id },
              { eventType: 'SOLD', userId: params.id }
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
            userId: params.id
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