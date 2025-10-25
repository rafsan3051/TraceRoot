import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const userId = params.userId

    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to verify user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}