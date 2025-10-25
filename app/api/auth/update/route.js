import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-utils'
import prisma from '@/lib/prisma'

export async function PUT(request) {
  try {
    const session = await getSession()
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: session.id
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    })

    // Return updated user data (excluding password)
    const { password: _, ...userData } = updatedUser
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    )
  }
}
