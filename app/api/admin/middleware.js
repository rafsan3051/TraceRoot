import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-utils'
import prisma from '@/lib/prisma'

export async function adminMiddleware(request) {
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return null // Allow request to proceed
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}