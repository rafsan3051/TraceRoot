import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminMiddleware } from '../middleware'

export async function GET(request) {
  // Check admin access
  const middleWareResult = await adminMiddleware(request)
  if (middleWareResult) return middleWareResult
  try {
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.user.count({
        where: { verified: false }
      }),
      prisma.user.count({
        where: { verified: true }
      })
    ])

    return NextResponse.json({
      totalUsers: stats[0],
      totalProducts: stats[1],
      pendingVerifications: stats[2],
      verifiedUsers: stats[3]
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}