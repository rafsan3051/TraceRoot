import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminMiddleware } from '../middleware'

export async function GET(request) {
  // Check admin access
  const middleWareResult = await adminMiddleware(request)
  if (middleWareResult) return middleWareResult

  try {
    const [users, products, events] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          phoneNumber: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.findMany({
        include: {
          farmer: {
            select: {
              name: true,
              email: true
            }
          },
          events: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.supplyChainEvent.findMany({
        include: {
          product: {
            select: {
              name: true,
              farmer: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 100
      })
    ])

    return NextResponse.json({
      users,
      products,
      events,
      stats: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalEvents: events.length,
        usersByRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}