import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-utils'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.id) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}