import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['FARMER', 'DISTRIBUTOR']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch recent users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}