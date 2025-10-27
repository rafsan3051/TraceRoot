import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const resolvedParams = await params
    
    const session = await getSession()
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only allow users to view their own profile or admins to view any profile
    if (currentUser.role !== 'ADMIN' && currentUser.id !== resolvedParams.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
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
        // Include products count and data based on role
        ...(currentUser.role === 'FARMER' && {
          products: {
            select: {
              id: true,
              name: true,
              origin: true,
              createdAt: true
            }
          }
        }),
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}